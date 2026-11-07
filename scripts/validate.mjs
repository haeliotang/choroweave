#!/usr/bin/env node
/**
 * choroweave 仓库自检（零依赖，Node >= 18；不执行 npm install）
 *
 * 用法：
 *   node scripts/validate.mjs             # 默认：schema / 示例 / 跨字段 / 链接 / ADR / 签名 / 文档长度
 *   node scripts/validate.mjs --strict    # 把 PENDING（计划中的文档）与 WARN 也视为失败（合稿/CI 用）
 *   node scripts/validate.mjs --json      # 机器可读输出
 *   node scripts/validate.mjs --verbose   # 打印每一条通过项
 *
 * 退出码：0 = 通过；1 = 有 FAIL（或 --strict 下有 WARN/PENDING）；2 = 运行环境错误。
 *
 * 设计约束：
 *   - 只用 node: 内置模块：fs / path / url / crypto。
 *   - JSON Schema 校验器只实现 draft 2020-12 的常用子集（$ref / type / required / properties /
 *     additionalProperties / items / enum / const / pattern / 长度 / 数值 / oneOf / anyOf / allOf /
 *     uniqueItems），足以覆盖本仓库 schemas/ 的使用面；不做远程 $ref 解析。
 */

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { resolve, dirname, basename, join, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash, createPublicKey, verify as cryptoVerify } from "node:crypto";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ARGS = new Set(process.argv.slice(2));
const STRICT = ARGS.has("--strict");
const JSON_OUT = ARGS.has("--json");
const VERBOSE = ARGS.has("--verbose");

const results = [];
let currentGroup = "general";
function group(name) { currentGroup = name; }
function record(kind, id, detail) {
  results.push({ kind, group: currentGroup, id, detail });
}
function pass(id, detail = "") { record("PASS", id, detail); }
function fail(id, detail) { record("FAIL", id, detail); }
function warn(id, detail) { record("WARN", id, detail); }
function pending(id, detail) { record("PENDING", id, detail); }
function skip(id, detail) { record("SKIP", id, detail); }

function attempt(id, fn) {
  try {
    const detail = fn();
    pass(id, typeof detail === "string" ? detail : "");
    return typeof detail === "string" ? detail : "";
  } catch (err) {
    fail(id, err instanceof Error ? err.message : String(err));
    return null;
  }
}

// ─────────────────────────────── 基础工具 ───────────────────────────────

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");
const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));
const lines = (p) => readFileSync(p, "utf8").split("\n").length - (readFileSync(p, "utf8").endsWith("\n") ? 1 : 0);

/** RFC 8785（JCS）的最小实现：对象键按 UTF-16 码元排序，无空白；值用 JSON.stringify 序列化。 */
function jcs(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return "[" + value.map(jcs).join(",") + "]";
  const keys = Object.keys(value).sort();
  return "{" + keys.map((k) => JSON.stringify(k) + ":" + jcs(value[k])).join(",") + "}";
}

function stripCodeFences(text) {
  return text.replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]*`/g, "");
}

function walkFiles(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walkFiles(p, out);
    else if (st.isFile()) out.push(p);
  }
  return out;
}

const display = (p) => relative(ROOT, p).split("\\").join("/");

// ─────────────────────────── JSON Schema 子集校验器 ───────────────────────────

const SCHEMA_REGISTRY = new Map(); // $id -> 解析后的 schema 文档

function loadSchemas() {
  const dir = join(ROOT, "schemas");
  if (!existsSync(dir)) throw new Error("schemas/ 目录不存在");
  const files = readdirSync(dir).filter((f) => f.endsWith(".schema.json")).sort();
  const docs = files.map((f) => ({ file: join(dir, f), name: f, schema: readJson(join(dir, f)) }));
  for (const d of docs) {
    if (!d.schema.$id) throw new Error(`${d.name}: 缺少 $id`);
    SCHEMA_REGISTRY.set(d.schema.$id, d.schema);
  }
  return docs;
}

function schemaPointer(doc, pointer) {
  // pointer 形如 "#/$defs/portal" 或 "#"
  if (pointer === "#" || pointer === "") return doc;
  if (!pointer.startsWith("#/")) throw new Error(`不支持的 $ref 片段: ${pointer}`);
  let node = doc;
  for (const raw of pointer.slice(2).split("/")) {
    const key = decodeURIComponent(raw).replace(/~1/g, "/").replace(/~0/g, "~");
    if (node == null || !(key in node)) throw new Error(`$ref 无法解析: ${pointer} (缺 ${key})`);
    node = node[key];
  }
  return node;
}

function resolveRef(ref, rootDoc) {
  if (ref.startsWith("#")) return { schema: schemaPointer(rootDoc, ref), root: rootDoc, ref };
  const hashAt = ref.indexOf("#");
  const uri = hashAt >= 0 ? ref.slice(0, hashAt) : ref;
  const frag = hashAt >= 0 ? "#" + ref.slice(hashAt + 1) : "#";
  const target = SCHEMA_REGISTRY.get(uri);
  if (!target) throw new Error(`$ref 指向未知 schema: ${ref}`);
  return { schema: schemaPointer(target, frag), root: target, ref };
}

function typeOfValue(v) {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  if (typeof v === "number") return Number.isInteger(v) ? "integer" : "number";
  return typeof v; // string | boolean | object
}

function typeMatches(v, type) {
  if (type === "integer") return typeof v === "number" && Number.isInteger(v);
  if (type === "number") return typeof v === "number" && Number.isFinite(v);
  if (type === "object") return v !== null && typeof v === "object" && !Array.isArray(v);
  if (type === "array") return Array.isArray(v);
  return typeOfValue(v) === type;
}

function deepEqual(a, b) {
  return jcs(a) === jcs(b);
}

function describePath(path) {
  return path.map((p) => (typeof p === "number" ? `[${p}]` : `.${p}`)).join("").replace(/^\./, "$");
}

function validateInstance(instance, schema, rootDoc, path = []) {
  const errors = [];
  if (schema === true || schema == null) return errors;
  if (schema === false) return [`${describePath(path)}: schema 为 false`];

  if (schema.$ref) {
    const target = resolveRef(schema.$ref, rootDoc);
    return validateInstance(instance, target.schema, target.root, path);
  }

  if (schema.const !== undefined && !deepEqual(instance, schema.const)) {
    errors.push(`${describePath(path)}: 应为常量 ${JSON.stringify(schema.const)}，实际 ${JSON.stringify(instance)}`);
  }
  if (Array.isArray(schema.enum) && !schema.enum.some((v) => deepEqual(instance, v))) {
    errors.push(`${describePath(path)}: 不在枚举 ${JSON.stringify(schema.enum)} 内（实际 ${JSON.stringify(instance)}）`);
  }
  if (schema.type !== undefined) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!types.some((t) => typeMatches(instance, t))) {
      errors.push(`${describePath(path)}: 类型应为 ${types.join("|")}，实际 ${typeOfValue(instance)}`);
      return errors; // 类型不符时不再深入
    }
  }

  if (typeof instance === "object" && instance !== null && !Array.isArray(instance)) {
    for (const req of schema.required || []) {
      if (!(req in instance)) errors.push(`${describePath(path)}.${req}: 缺少必填字段`);
    }
    const props = schema.properties || {};
    for (const [key, sub] of Object.entries(props)) {
      if (key in instance) errors.push(...validateInstance(instance[key], sub, rootDoc, [...path, key]));
    }
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(instance)) {
        if (!(key in props)) errors.push(`${describePath(path)}.${key}: 不允许的额外字段`);
      }
    }
  }

  if (Array.isArray(instance)) {
    if (schema.minItems !== undefined && instance.length < schema.minItems)
      errors.push(`${describePath(path)}: 至少 ${schema.minItems} 项，实际 ${instance.length}`);
    if (schema.maxItems !== undefined && instance.length > schema.maxItems)
      errors.push(`${describePath(path)}: 至多 ${schema.maxItems} 项，实际 ${instance.length}`);
    if (schema.uniqueItems) {
      const seen = new Set();
      for (const item of instance) {
        const key = jcs(item);
        if (seen.has(key)) errors.push(`${describePath(path)}: 数组元素重复 ${key.slice(0, 60)}`);
        seen.add(key);
      }
    }
    if (schema.items) instance.forEach((item, i) => errors.push(...validateInstance(item, schema.items, rootDoc, [...path, i])));
  }

  if (typeof instance === "string") {
    if (schema.minLength !== undefined && instance.length < schema.minLength)
      errors.push(`${describePath(path)}: 长度至少 ${schema.minLength}，实际 ${instance.length}`);
    if (schema.maxLength !== undefined && instance.length > schema.maxLength)
      errors.push(`${describePath(path)}: 长度至多 ${schema.maxLength}，实际 ${instance.length}`);
    if (schema.pattern) {
      let re;
      try { re = new RegExp(schema.pattern); } catch { errors.push(`${schema.pattern}: 非法正则`); }
      if (re && !re.test(instance)) errors.push(`${describePath(path)}: 不匹配 ${schema.pattern}（实际 ${JSON.stringify(instance)}）`);
    }
  }

  if (typeof instance === "number") {
    if (schema.minimum !== undefined && instance < schema.minimum)
      errors.push(`${describePath(path)}: 应 ≥ ${schema.minimum}，实际 ${instance}`);
    if (schema.maximum !== undefined && instance > schema.maximum)
      errors.push(`${describePath(path)}: 应 ≤ ${schema.maximum}，实际 ${instance}`);
  }

  for (const sub of schema.allOf || []) errors.push(...validateInstance(instance, sub, rootDoc, path));
  if (schema.anyOf) {
    const ok = schema.anyOf.some((sub) => validateInstance(instance, sub, rootDoc, path).length === 0);
    if (!ok) errors.push(`${describePath(path)}: 不满足 anyOf 任一分支`);
  }
  if (schema.oneOf) {
    const okCount = schema.oneOf.filter((sub) => validateInstance(instance, sub, rootDoc, path).length === 0).length;
    if (okCount !== 1) errors.push(`${describePath(path)}: oneOf 应恰好命中 1 个分支，实际 ${okCount}`);
  }

  return errors;
}

function collectRefs(node, out = []) {
  if (Array.isArray(node)) { node.forEach((n) => collectRefs(n, out)); return out; }
  if (node && typeof node === "object") {
    if (typeof node.$ref === "string") out.push(node.$ref);
    for (const v of Object.values(node)) collectRefs(v, out);
  }
  return out;
}

/** 递归收集"schema 定义但示例缺失的属性名"（数组按"所有元素都缺失"取交集，避免异构实体误报）。 */
function missingProperties(instance, schema, rootDoc, out = new Set()) {
  if (!schema || typeof schema !== "object") return out;
  if (schema.$ref) {
    const t = resolveRef(schema.$ref, rootDoc);
    return missingProperties(instance, t.schema, t.root, out);
  }
  if (schema.properties && instance !== null && typeof instance === "object" && !Array.isArray(instance)) {
    for (const [key, sub] of Object.entries(schema.properties)) {
      if (!(key in instance)) out.add(key);
      else missingProperties(instance[key], sub, rootDoc, out);
    }
  }
  if (schema.items && Array.isArray(instance) && instance.length > 0) {
    const perItem = instance.map((item) => missingProperties(item, schema.items, rootDoc, new Set()));
    const common = [...perItem[0]].filter((key) => perItem.every((set) => set.has(key)));
    for (const key of common) out.add(key);
  }
  return out;
}

// ───────────────────────────────── 链接检查 ─────────────────────────────────

// 这些交付物由其他写作角色并行产出；在合稿前的中间态 checkout 中允许暂时缺失。
// 用 `--strict`（CI/合稿）时它们必须存在，否则 FAIL。
const PLANNED_DOCS = new Set([
  "docs/00-executive-summary.md",
  "docs/01-landscape.md",
  "docs/05-roadmap.md",
  "docs/06-mvp-spec.md",
  "docs/07-risks-compliance.md",
  "docs/08-open-source-strategy.md",
]);

const LINK_RE = /(!?)\[[^\]]*\]\(\s*<?([^)>\s]+)>?(?:\s+"[^"]*")?\s*\)/g;

function checkLinks() {
  const files = [];
  const readme = join(ROOT, "README.md");
  if (existsSync(readme)) files.push(readme);
  for (const f of walkFiles(join(ROOT, "docs"))) if (extname(f) === ".md") files.push(f);
  for (const f of walkFiles(join(ROOT, "examples"))) if (extname(f) === ".md") files.push(f);

  let checked = 0, skipped = 0;
  const problems = [];
  const pendingLinks = [];
  const internalProblems = [];
  for (const file of files) {
    const text = stripCodeFences(readFileSync(file, "utf8"));
    for (const match of text.matchAll(LINK_RE)) {
      const target = match[2].trim();
      if (!target || target.startsWith("#")) { skipped++; continue; }
      if (/^[a-z][a-z0-9+.-]*:/i.test(target) && !target.startsWith("file:")) { skipped++; continue; }
      const clean = target.split("#")[0].split("?")[0];
      if (!clean) { skipped++; continue; }
      if (clean.startsWith("/")) { skipped++; continue; } // 站点绝对路径，无法离线校验
      checked++;
      const resolved = resolve(dirname(file), decodeURIComponent(clean));
      if (existsSync(resolved)) continue;
      const relToRoot = display(resolved);
      if (PLANNED_DOCS.has(relToRoot)) {
        pendingLinks.push(`${display(file)} -> ${relToRoot}`);
        continue;
      }
      // docs/internal/ 下的流程留档（writing-spec / plan-outline）不作为交付物；
      // 其指向的路径可能是历史编排产物，不因它们让仓库自检失败，但会显式 SKIP。
      if (display(file).startsWith("docs/internal/")) { internalProblems.push(`${display(file)} -> ${target}`); continue; }
      problems.push(`${display(file)} -> ${target}`);
    }
  }
  if (problems.length) throw new Error(`失效相对链接（${problems.length}）：\n    ` + problems.join("\n    "));
  if (internalProblems.length) skip("link.internal", `${internalProblems.length} 条失效链接位于 docs/internal/ 流程留档（writing-spec/plan-outline），不参与校验`);
  if (pendingLinks.length) {
    if (STRICT) throw new Error(`[--strict] 计划文档缺失（${pendingLinks.length}）：\n    ` + pendingLinks.join("\n    "));
    pending("link.planned", `${pendingLinks.length} 个指向计划中文档的链接暂缺（合稿后应存在）`);
  }
  return `${files.length} 个 Markdown 文件 / 校验 ${checked} 条相对链接，全部存在`;
}

// ───────────────────────────────── 各检查组 ─────────────────────────────────

function checkSchemas(docs) {
  const draft = "https://json-schema.org/draft/2020-12/schema";
  let refCount = 0;
  for (const { name, schema } of docs) {
    if (schema.$schema !== draft) throw new Error(`${name}: $schema 必须是 draft 2020-12`);
    if (!/^urn:choroweave:schemas:[a-z-]+:0\.1$/.test(schema.$id)) throw new Error(`${name}: $id 命名不符合 urn:choroweave:schemas:*:0.1`);
    if (!schema.title || typeof schema.title !== "string") throw new Error(`${name}: 缺少 title`);
    if (schema.type !== "object") throw new Error(`${name}: 根类型应为 object`);
    if (schema.additionalProperties !== false) throw new Error(`${name}: 根应为 additionalProperties: false`);
    if (!Array.isArray(schema.required) || schema.required.length === 0) throw new Error(`${name}: 缺少非空 required`);
    if (!schema.$defs || Object.keys(schema.$defs).length === 0) throw new Error(`${name}: 缺少 $defs`);
    for (const ref of collectRefs(schema)) {
      if (ref.startsWith("#")) schemaPointer(schema, ref);
      else if (!SCHEMA_REGISTRY.has(ref.split("#")[0])) throw new Error(`${name}: 悬空 $ref ${ref}`);
      refCount++;
    }
    // 每个 required 字段必须出现在 properties（或由 $ref 引入），否则 schema 自相矛盾
    const rootProps = schema.properties || {};
    for (const req of schema.required) {
      if (!(req in rootProps)) throw new Error(`${name}: required 字段 ${req} 未在 properties 中定义`);
    }
  }
  return `${docs.length} 个 schema（draft 2020-12）/ ${refCount} 个 $ref 可解析 / required 与 properties 一致`;
}

function checkExample(relDsl, relManifest, dslSchemaDocs) {
  const dslPath = join(ROOT, relDsl);
  const manifestPath = join(ROOT, relManifest);
  const dsl = readJson(dslPath);
  const manifest = readJson(manifestPath);
  const dslSchema = SCHEMA_REGISTRY.get("urn:choroweave:schemas:spatial-dsl:0.1");
  const manifestSchema = SCHEMA_REGISTRY.get("urn:choroweave:schemas:world-manifest:0.1");
  const issSchema = SCHEMA_REGISTRY.get("urn:choroweave:schemas:implicit-spatial-spec:0.1");

  group("example");
  const dslErrors = validateInstance(dsl, dslSchema, dslSchema);
  if (dslErrors.length) throw new Error(`world.dsl.json 未通过 spatial-dsl schema（${dslErrors.length}）：\n    ` + dslErrors.slice(0, 12).join("\n    "));
  pass("example.dsl.schema", "world.dsl.json 通过 spatial-dsl.schema.json");

  const manifestErrors = validateInstance(manifest, manifestSchema, manifestSchema);
  if (manifestErrors.length) throw new Error(`world.json 未通过 world-manifest schema（${manifestErrors.length}）：\n    ` + manifestErrors.slice(0, 12).join("\n    "));
  pass("example.manifest.schema", "world.json 通过 world-manifest.schema.json");

  const iss = dsl?.intent?.iss;
  if (iss) {
    const issErrors = validateInstance(iss, issSchema, issSchema);
    if (issErrors.length) throw new Error(`ISS 快照未通过 implicit-spatial-spec schema：\n    ` + issErrors.join("\n    "));
    const unsigned = { ...iss }; delete unsigned.integrity;
    const expect = sha256(Buffer.from(jcs(unsigned), "utf8"));
    if (!iss.integrity || iss.integrity.value !== expect) throw new Error(`ISS integrity 不匹配（期望 ${expect}）`);
    pass("example.iss.schema+integrity", "ISS 通过契约校验；integrity = sha256(JCS(iss 去掉 integrity))");
  } else {
    warn("example.iss", "world.dsl.json 未携带 ISS 快照（可选）");
  }

  // 交叉一致性
  if (dsl.world.id !== manifest.id) throw new Error(`世界 id 不一致：dsl=${dsl.world.id} manifest=${manifest.id}`);
  if (dsl.dslVersion !== manifest.schemaVersion || manifest.protocol.version !== dsl.dslVersion)
    throw new Error("版本不一致：dslVersion / schemaVersion / protocol.version 必须同为 0.1");
  pass("example.cross.id+version", "world.id 与版本三元组一致（0.1 / SHP 0.1）");

  const entities = dsl.entities;
  const ids = new Set();
  for (const e of entities) {
    if (ids.has(e.id)) throw new Error(`实体 id 重复：${e.id}`);
    ids.add(e.id);
    const partNames = new Set();
    for (const p of e.parts) {
      if (partNames.has(p.name)) throw new Error(`实体 ${e.id} 内 part 名重复：${p.name}`);
      partNames.add(p.name);
    }
  }
  const entityById = new Map(entities.map((e) => [e.id, e]));
  const partsCount = entities.reduce((n, e) => n + e.parts.length, 0);
  const spawnEntities = entities.filter((e) => e.kind === "spawn");
  if (spawnEntities.length !== 1) throw new Error(`应有且仅有 1 个 spawn 实体，实际 ${spawnEntities.length}`);
  if (manifest.spawn.node !== spawnEntities[0].id) throw new Error(`manifest.spawn.node=${manifest.spawn.node} 未指向 spawn 实体`);
  pass("example.cross.spawn", `spawn.node = ${manifest.spawn.node} 指向 kind=spawn 实体`);

  const interactionIds = new Set();
  for (const i of dsl.interactions || []) {
    if (interactionIds.has(i.id)) throw new Error(`交互 id 重复：${i.id}`);
    interactionIds.add(i.id);
    if (!entityById.has(i.entity)) throw new Error(`交互 ${i.id} 引用不存在的实体 ${i.entity}`);
    if (entityById.get(i.entity).kind === "portal" && !i.actions.some((a) => a.op === "openPortal"))
      warn(`example.interaction.${i.id}`, "portal 实体的交互未包含 openPortal 动作");
  }
  for (const e of entities) {
    if (e.interaction) {
      if (!interactionIds.has(e.interaction.graph)) throw new Error(`实体 ${e.id} 的 interaction.graph=${e.interaction.graph} 不存在`);
      if (e.kind === "portal" && e.portalId === undefined) throw new Error(`portal 实体 ${e.id} 缺少 portalId`);
    }
  }
  pass("example.cross.interactions", `${(dsl.interactions || []).length} 条交互引用有效；实体/part id 唯一`);

  // 门户：DSL 与 manifest 同构
  const dslPortals = dsl.portals || [];
  const manPortals = manifest.portals || [];
  if (dslPortals.length !== manPortals.length) throw new Error(`门户数量不一致：dsl=${dslPortals.length} manifest=${manPortals.length}`);
  for (const p of dslPortals) {
    const m = manPortals.find((x) => x.id === p.id);
    if (!m) throw new Error(`manifest 缺少门户 ${p.id}`);
    for (const key of ["entity", "handoff", "version"]) {
      if (JSON.stringify(p[key]) !== JSON.stringify(m[key])) throw new Error(`门户 ${p.id} 的 ${key} 不一致`);
    }
    if (p.target.url !== m.target.url) throw new Error(`门户 ${p.id} 的 target.url 不一致`);
    if (!entityById.has(p.entity) || entityById.get(p.entity).kind !== "portal")
      throw new Error(`门户 ${p.id} 的 entity=${p.entity} 不是 kind=portal 实体`);
    if (entityById.get(p.entity).portalId !== p.id) throw new Error(`实体 ${p.entity}.portalId 未指向 ${p.id}`);
  }
  pass("example.cross.portals", `${dslPortals.length} 个门户：DSL / 清单同构，实体引用有效`);

  // capabilities 与场景实际使用的扩展
  const caps = manifest.capabilities;
  const usedColliders = entities.some((e) => e.parts.some((p) => p.collider && p.collider !== "none"));
  if (dslPortals.length > 0 && !caps.extensions.includes("CHW_portal")) throw new Error("使用门户但 capabilities.extensions 未声明 CHW_portal");
  if (usedColliders && !caps.extensions.includes("CHW_collider")) throw new Error("使用碰撞体但未声明 CHW_collider");
  if (caps.sync.whitelist.some((w) => w.includes("CHW_logic")) && !caps.extensions.includes("CHW_logic"))
    throw new Error("同步白名单引用 CHW_logic 属性但未声明该扩展");
  pass("example.cross.capabilities", `extensions = ${caps.extensions.join(", ")} 覆盖场景实际使用`);

  // 同步白名单：命名指针可解析到实体；线上语义必须是 Object Model pointer
  const NAMED_POINTER = /^\/nodes\/\{([A-Za-z_][A-Za-z0-9_]*)\}\/[A-Za-z0-9_]+(\/[A-Za-z0-9_]+)*$/;
  const LOGIC_PROP = /^\/extensions\/CHW_logic\/props\/[A-Za-z_][A-Za-z0-9_]*$/;
  for (const w of caps.sync.whitelist) {
    const named = NAMED_POINTER.exec(w);
    if (named) {
      if (!entityById.has(named[1])) throw new Error(`同步白名单命名指针 ${w} 指向不存在的实体 ${named[1]}`);
      continue;
    }
    if (LOGIC_PROP.test(w)) continue;
    throw new Error(`同步白名单项 ${w} 不是合法命名指针/CHW_logic 属性`);
  }
  if (!(caps.sync.rateHz > 0 && caps.sync.rateHz <= 30)) throw new Error("sync.rateHz 超出 1..30");
  pass("example.cross.sync", `${caps.sync.whitelist.length} 条白名单指针可解析（命名指针 → glTF Object Model pointer）`);

  // 预算：DSL 与 manifest 一致
  const map = { triangles: "triangles", drawCalls: "drawCalls", textureMB: "textureMB", firstByteKB: "firstByteKB" };
  for (const [dslKey, manKey] of Object.entries(map)) {
    if (dsl.budget[dslKey] !== manifest.perf.budget[manKey])
      throw new Error(`预算不一致：dsl.budget.${dslKey}=${dsl.budget[dslKey]} vs manifest.perf.budget.${manKey}=${manifest.perf.budget[manKey]}`);
  }
  if (manifest.perf.budget.triangles > dsl.intent.constraints.maxTriangles) throw new Error("perf.budget.triangles 超过意图约束");
  if (manifest.perf.budget.drawCalls > dsl.intent.constraints.maxDrawCalls) throw new Error("perf.budget.drawCalls 超过意图约束");
  pass("example.cross.budget", `预算一致：${dsl.budget.triangles} tri / ${dsl.budget.drawCalls} dc / ${dsl.budget.textureMB} MB / ${dsl.budget.firstByteKB} KB`);

  // 资产与预览占位摘要（方案仓库不携带二进制；规则见 examples/README）
  const checkDigest = (declared, relPath, kind) => {
    const abs = join(dirname(manifestPath), relPath);
    const expected = existsSync(abs)
      ? sha256(readFileSync(abs))
      : sha256(Buffer.from("choroweave-example-placeholder\n" + relPath, "utf8"));
    if (declared !== expected) throw new Error(`${kind} ${relPath} 摘要不匹配（声明 ${declared.slice(0, 12)}…，期望 ${expected.slice(0, 12)}…）`);
    return existsSync(abs) ? "file" : "placeholder";
  };
  const seenSha = new Set();
  for (const a of manifest.assets) {
    if (seenSha.has(a.sha256)) throw new Error(`资产摘要重复：${a.sha256}`);
    seenSha.add(a.sha256);
    if (a.path.includes("..")) throw new Error(`资产路径禁止 ..：${a.path}`);
    checkDigest(a.sha256, a.path, "assets[]");
  }
  for (const p of manPortals) if (p.preview) checkDigest(p.preview.sha256, p.preview.image, "preview");
  pass("example.assets.digest", `${manifest.assets.length} 个资产 + ${manPortals.filter((p) => p.preview).length} 个预览：均为占位摘要（可被 validate 复算）`);

  // provenance：inputHash / promptHash 可复算
  const issSnap = dsl.intent.iss || null;
  const envelope = {
    prompt: dsl.intent.prompt,
    iss: issSnap,
    constraints: dsl.intent.constraints,
    compiler: dsl.provenance.compiler,
    compilerVersion: dsl.provenance.version,
    seed: dsl.world.seed,
  };
  const expectInput = sha256(Buffer.from(jcs(envelope), "utf8"));
  if (dsl.provenance.inputHash !== expectInput)
    throw new Error(`provenance.inputHash 不匹配（期望 ${expectInput.slice(0, 16)}…）`);
  const expectPrompt = sha256(Buffer.from(dsl.intent.prompt, "utf8"));
  if (dsl.provenance.model.promptHash !== expectPrompt)
    throw new Error(`provenance.model.promptHash 不匹配（期望 ${expectPrompt.slice(0, 16)}…）`);
  pass("example.provenance.hash", "inputHash = sha256(JCS(意图信封))，promptHash = sha256(prompt)，均可复算");

  // 作者签名：ed25519 + JCS
  if (manifest.signature) {
    const jwk = manifest.author?.jwk;
    if (!jwk) throw new Error("world.json 有 signature 但缺少 author.jwk");
    const sig = manifest.signature;
    if (sig.alg !== "ed25519") throw new Error(`不支持的签名算法：${sig.alg}`);
    if (sig.canonicalization && sig.canonicalization !== "RFC8785-JCS") throw new Error("签名规范化必须为 RFC8785-JCS");
    const unsigned = { ...manifest }; delete unsigned.signature;
    const key = createPublicKey({ key: { kty: jwk.kty, crv: jwk.crv, x: jwk.x }, format: "jwk" });
    const ok = cryptoVerify(null, Buffer.from(jcs(unsigned), "utf8"), key, Buffer.from(sig.value, "base64url"));
    if (!ok) throw new Error("ed25519 签名验证失败（world.json 被修改或 key 不匹配）");
    pass("example.manifest.signature", `ed25519 + JCS 验签通过（keyId = ${sig.keyId}）`);
  } else {
    warn("example.manifest.signature", "示例未签名：按 SHP §8.3 降级为 unverified（允许，但 P1 起示例 SHOULD 签名）");
  }

  return { dsl, manifest, stats: { entities: entities.length, parts: partsCount, interactions: (dsl.interactions || []).length, portals: dslPortals.length } };
}

function checkDocs() {
  group("docs");
  const arch = join(ROOT, "docs/03-architecture.md");
  const proto = join(ROOT, "docs/04-spatial-hyperlink-protocol.md");
  for (const [file, min, max] of [[arch, 350, 600], [proto, 350, 600]]) {
    const n = lines(file);
    if (n < min || n > max) throw new Error(`${display(file)} 行数 ${n} 不在 ${min}-${max} 区间`);
    pass(`docs.length.${display(file).split("/").pop()}`, `${n} 行（要求 ${min}-${max}）`);
  }

  // 每份契约文档的标题/版本锚点
  const protoText = readFileSync(proto, "utf8");
  const archText = readFileSync(arch, "utf8");
  for (const needle of ["SHP）v0.1", "world.json", "CHW_portal", "handoff", "ed25519", "JCS", "weave-check"]) {
    if (!protoText.includes(needle)) throw new Error(`docs/04 缺少契约锚点 "` + needle + `"`);
  }
  for (const needle of ["九阶段", "World Bundle", "Runtime Adapter", "WSP", "sync.whitelist", "P0-P4", "ISS"]) {
    if (!archText.includes(needle)) throw new Error(`docs/03 缺少契约锚点 "` + needle + `"`);
  }
  pass("docs.anchors", "03/04 含必需的结构锚点（管线 / Bundle / WSP / ISS / SHP 字段）");

  // ADR 一致性：02 中定义 ADR-01..12；任何文档不得引用不存在的 ADR
  const sel = join(ROOT, "docs/02-tech-selection.md");
  const selText = readFileSync(sel, "utf8");
  const defined = new Set([...selText.matchAll(/ADR-(\d{2})/g)].map((m) => m[1]));
  const expected = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const missing = expected.filter((n) => !defined.has(n));
  if (missing.length) throw new Error(`docs/02 缺少 ADR：${missing.join(", ")}`);
  const docFiles = walkFiles(join(ROOT, "docs")).filter((f) => extname(f) === ".md" && !f.includes("/research/"));
  const badRefs = [];
  for (const file of docFiles) {
    const text = readFileSync(file, "utf8");
    for (const m of text.matchAll(/ADR-(\d{2})/g)) if (!defined.has(m[1])) badRefs.push(`${display(file)}: ADR-${m[1]}`);
  }
  if (badRefs.length) throw new Error(`引用了不存在的 ADR：${badRefs.join(", ")}`);
  pass("docs.adr", `ADR-01..12 齐备；${docFiles.length} 份文档无越界引用`);

  // world.json 顶层必填字段必须在 04 的字段表出现；schemas 与 04 不一致即视为缺陷
  const manifestSchema = SCHEMA_REGISTRY.get("urn:choroweave:schemas:world-manifest:0.1");
  const missingFields = (manifestSchema.required || []).filter((f) => !protoText.includes(f));
  if (missingFields.length) throw new Error(`docs/04 未定义 world.json 必填字段：${missingFields.join(", ")}`);
  const handoff = manifestSchema.$defs.portal.properties.handoff.enum;
  for (const v of handoff) if (!protoText.includes(v)) throw new Error(`docs/04 缺少 handoff 枚举值 ${v}`);
  const extEnum = manifestSchema.$defs.capabilities.properties.extensions.items.enum;
  for (const v of extEnum) if (!protoText.includes(v)) throw new Error(`docs/04 缺少 CHW 扩展 ${v}`);
  pass("docs.schema-consistency", `world.json 必填字段 / handoff 枚举 / CHW 扩展在 04 中均有定义`);

  // CHW 扩展：02 定义 CHW_ 前缀与 CHW_portal；03/04 必须覆盖完整枚举
  if (!selText.includes("CHW_portal") || !selText.includes("CHW_")) throw new Error("docs/02 缺少 CHW_ 扩展前缀或 CHW_portal");
  for (const file of [arch, proto]) {
    const text = readFileSync(file, "utf8");
    for (const ext of extEnum) if (!text.includes(ext)) throw new Error(`${display(file)} 缺少扩展 ${ext}`);
  }
  pass("docs.extensions", "CHW_portal / CHW_collider / CHW_logic / CHW_avatar 在 03、04 一致出现；02 定义 CHW_ 前缀与 CHW_portal");
}

function checkEnglishDocs() {
  group("docs.en");
  const dir = join(ROOT, "docs/en");
  const required = [
    "README.md",
    "00-executive-summary.md",
    "01-landscape.md",
    "02-tech-selection.md",
    "03-architecture.md",
    "04-spatial-hyperlink-protocol.md",
    "05-roadmap.md",
    "06-mvp-spec.md",
    "07-risks-compliance.md",
    "08-open-source-strategy.md",
    "research/01-spatial-web-platforms.md",
    "research/02-generative-3d-and-agents.md",
    "research/03-runtime-standards.md",
    "research/04-products-market-prior-art.md",
  ];
  const missing = required.filter((f) => !existsSync(join(dir, f)));
  if (missing.length) throw new Error(`missing English docs: ${missing.join(", ")}`);
  for (const [f, min, max] of [["03-architecture.md", 350, 600], ["04-spatial-hyperlink-protocol.md", 350, 600]]) {
    const n = lines(join(dir, f));
    if (n < min || n > max) throw new Error(`docs/en/${f} has ${n} lines, not in ${min}-${max}`);
  }
  const proto = readFileSync(join(dir, "04-spatial-hyperlink-protocol.md"), "utf8");
  for (const needle of ["Spatial Hyperlink Protocol", "world.json", "CHW_portal", "handoff", "ed25519", "JCS", "weave-check"]) {
    if (!proto.includes(needle)) throw new Error(`docs/en/04 missing anchor "${needle}"`);
  }
  const arch = readFileSync(join(dir, "03-architecture.md"), "utf8");
  for (const needle of ["World Bundle", "Runtime Adapter", "WSP", "sync.whitelist", "ISS", "P0-P4"]) {
    if (!arch.includes(needle)) throw new Error(`docs/en/03 missing anchor "${needle}"`);
  }
  const sel = readFileSync(join(dir, "02-tech-selection.md"), "utf8");
  for (let i = 1; i <= 12; i++) {
    const id = `ADR-${String(i).padStart(2, "0")}`;
    if (!sel.includes(id)) throw new Error(`docs/en/02 missing ${id}`);
  }
  pass("docs.en", `${required.length} English docs present; 03/04 within 350-600 lines; anchors + ADR-01..12 OK`);
}

function checkCoverage(example) {
  group("coverage");
  const manifestSchema = SCHEMA_REGISTRY.get("urn:choroweave:schemas:world-manifest:0.1");
  const dslSchema = SCHEMA_REGISTRY.get("urn:choroweave:schemas:spatial-dsl:0.1");
  const docsText = [
    readFileSync(join(ROOT, "docs/03-architecture.md"), "utf8"),
    readFileSync(join(ROOT, "docs/04-spatial-hyperlink-protocol.md"), "utf8"),
  ].join("\n");

  const report = [];
  for (const [label, instance, schema] of [
    ["world.json", example.manifest, manifestSchema],
    ["world.dsl.json", example.dsl, dslSchema],
  ]) {
    const missing = [...missingProperties(instance, schema, schema)];
    const documentedOptional = [];
    const undocumented = [];
    for (const name of missing) {
      const candidates = ["`" + name + "`", "`" + name + "?`", name];
      const line = docsText.split("\n").find((l) => candidates.some((c) => l.includes(c)) && /(○|可选|optional|\?)/.test(l));
      if (line) documentedOptional.push(name); else undocumented.push(name);
    }
    if (undocumented.length) report.push(`${label}: 未在示例出现且未在文档标注 optional：${undocumented.join(", ")}`);
    else if (documentedOptional.length) report.push(`${label}: ${documentedOptional.length} 个可选字段未出现（文档已标注 optional：${documentedOptional.join(", ")}）`);
    else report.push(`${label}: schema 属性全部出现在示例中`);
  }
  if (report.some((r) => r.includes("未在文档标注"))) throw new Error(report.join("；"));
  pass("coverage.example", report.join("；"));
}

function checkRepo() {
  group("repo");
  const required = [join(ROOT, "README.md"), join(ROOT, "docs/internal/writing-spec.md"), join(ROOT, "docs/02-tech-selection.md")];
  const missing = required.filter((p) => !existsSync(p));
  if (missing.length) throw new Error(`缺少文件：${missing.map(display).join(", ")}`);
  pass("repo.files", "README / docs/internal/writing-spec / 02-tech-selection 存在");

  // 03 与 04 的交叉链接必须指向真实文件（链接总检查已覆盖；这里校验两份文档互相引用）
  const arch = readFileSync(join(ROOT, "docs/03-architecture.md"), "utf8");
  const proto = readFileSync(join(ROOT, "docs/04-spatial-hyperlink-protocol.md"), "utf8");
  if (!arch.includes("04-spatial-hyperlink-protocol.md")) throw new Error("docs/03 未链接到 04");
  if (!proto.includes("03-architecture.md")) throw new Error("docs/04 未链接到 03");
  pass("repo.cross-links", "docs/03 ⇄ docs/04 互相引用");

  if (existsSync(join(ROOT, "package.json"))) {
    const pkg = readJson(join(ROOT, "package.json"));
    if (pkg.scripts?.validate && !String(pkg.scripts.validate).includes("validate.mjs"))
      throw new Error("package.json scripts.validate 未指向 scripts/validate.mjs");
  } else {
    skip("repo.package-json", "仓库当前无 package.json（方案阶段，validate 直接以 node 运行）");
  }
}

// ───────────────────────────────── 主流程 ─────────────────────────────────

function main() {
  const t0 = Date.now();
  const docs = loadSchemas();

  group("schemas");
  const schemasDetail = attempt("schemas.meta", () => checkSchemas(docs));

  group("example");
  let example = null;
  const exampleDetail = attempt("example", () => {
    example = checkExample("examples/pixel-rooftop/world.dsl.json", "examples/pixel-rooftop/world.json", docs);
    const st = example.stats;
    return `pixel-rooftop：${st.entities} 实体 / ${st.parts} parts / ${st.interactions} 交互 / ${st.portals} 门户`;
  });

  group("docs");
  attempt("docs", () => checkDocs());
  attempt("docs.en", () => checkEnglishDocs());

  group("coverage");
  if (example) attempt("coverage", () => checkCoverage(example));
  else skip("coverage.example", "示例校验失败，跳过覆盖度检查");

  group("links");
  attempt("link.exists", () => checkLinks());

  group("repo");
  attempt("repo", () => checkRepo());

  const counts = results.reduce((acc, r) => ((acc[r.kind] = (acc[r.kind] || 0) + 1), acc), {});
  const failed = counts.FAIL || 0;
  const nonPass = (counts.WARN || 0) + (counts.PENDING || 0);
  const ok = failed === 0 && (!STRICT || nonPass === 0);
  const elapsed = Date.now() - t0;

  if (JSON_OUT) {
    process.stdout.write(JSON.stringify({ ok, strict: STRICT, counts, elapsedMs: elapsed, results }, null, 2) + "\n");
  } else {
    const print = (r) => {
      if (r.kind === "PASS" && !VERBOSE) return;
      const detail = r.detail ? ` — ${r.detail}` : "";
      process.stdout.write(`  ${r.kind.padEnd(7)} ${r.id}${detail}\n`);
    };
    process.stdout.write("== choroweave repo self-check ==\n");
    let lastGroup = null;
    for (const r of results) {
      if (r.group !== lastGroup) { process.stdout.write(`[${r.group}]\n`); lastGroup = r.group; }
      print(r);
    }
    process.stdout.write("\n-- summary --\n");
    for (const kind of ["PASS", "FAIL", "WARN", "PENDING", "SKIP"]) {
      if (counts[kind]) process.stdout.write(`  ${kind}: ${counts[kind]}\n`);
    }
    if (schemasDetail) process.stdout.write(`  schemas: ${schemasDetail}\n`);
    if (exampleDetail) process.stdout.write(`  example: ${exampleDetail}\n`);
    process.stdout.write(`  elapsed: ${elapsed} ms\n`);
    process.stdout.write(`\nRESULT: ${ok ? "PASS" : "FAIL"}${STRICT ? " (--strict)" : ""}\n`);
  }
  process.exit(ok ? 0 : 1);
}

try {
  main();
} catch (err) {
  process.stderr.write(`validate.mjs 运行错误：${err instanceof Error ? err.stack : String(err)}\n`);
  process.exit(2);
}
