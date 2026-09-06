import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Plus, X, Trash2, Copy, Download, Upload, Save, FolderOpen, Layers,
  Image as ImageIcon, Minus, Crosshair, ClipboardList, Check, Files, Pencil
} from "lucide-react";

/* ============================================================================
   VESSU RENDER LAB — FREE VERSION
   A workflow builder and prompt composer. It never generates images.
   No API keys, no backend, no paid services.
   ========================================================================== */

/* ----------------------------- design tokens ----------------------------- */

const CSS = `
.vrl { --ink:#141310; --surface:#1c1b18; --raised:#232120; --sunken:#100f0d;
  --line:#332f2a; --line-soft:#282521; --fg:#e9e5dd; --fg-2:#a49e94; --fg-3:#726c63;
  --mint:#2dd2aa; --teal:#3f9db0; --navy:#4a7f9e; --sand:#c9c0ad; --amber:#c9b76a; --alert:#c86a5a;
  position:fixed; inset:0; background:var(--ink); color:var(--fg);
  font-family:"Helvetica Neue",Helvetica,Inter,Arial,sans-serif;
  font-size:13px; line-height:1.5; -webkit-font-smoothing:antialiased;
  display:flex; flex-direction:column; overflow:hidden;
}
.vrl *,.vrl *::before,.vrl *::after{box-sizing:border-box}
.vrl button{font:inherit;color:inherit;background:none;border:none;cursor:pointer;padding:0}
.vrl input,.vrl textarea,.vrl select{font:inherit;color:var(--fg);background:var(--sunken);
  border:1px solid var(--line-soft);border-radius:2px;padding:6px 8px;width:100%;outline:none}
.vrl input:focus,.vrl textarea:focus,.vrl select:focus{border-color:var(--teal)}
.vrl textarea{resize:vertical;min-height:56px;line-height:1.45}
.vrl select{appearance:none;padding-right:22px;
  background-image:linear-gradient(45deg,transparent 50%,#8b857b 50%),linear-gradient(135deg,#8b857b 50%,transparent 50%);
  background-position:calc(100% - 13px) 12px,calc(100% - 8px) 12px;background-size:5px 5px,5px 5px;background-repeat:no-repeat}
.vrl ::-webkit-scrollbar{width:9px;height:9px}
.vrl ::-webkit-scrollbar-thumb{background:#332f2a;border-radius:0}
.vrl ::-webkit-scrollbar-track{background:transparent}
.vrl :focus-visible{outline:1px solid var(--teal);outline-offset:1px}

.vrl-lbl{font-size:10.5px;letter-spacing:.06em;color:var(--fg-3);margin-bottom:4px;display:block}
.vrl-btn{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;border-radius:2px;
  border:1px solid var(--line);color:var(--fg-2);white-space:nowrap;transition:color .12s,border-color .12s,background .12s}
.vrl-btn:hover{color:var(--fg);border-color:#4a453e;background:#211f1c}
.vrl-btn.pri{border-color:#2f6b64;color:var(--mint)}
.vrl-btn.pri:hover{background:rgba(45,210,170,.08);border-color:var(--mint)}
.vrl-btn.ghost{border-color:transparent}
.vrl-btn.ghost:hover{border-color:var(--line)}
.vrl-btn:disabled{opacity:.35;cursor:default}
.vrl-seg{display:inline-flex;border:1px solid var(--line);border-radius:2px;overflow:hidden;height:28px}
.vrl-seg button{padding:0 11px;font-size:11.5px;color:var(--fg-3);border-right:1px solid var(--line)}
.vrl-seg button:last-child{border-right:none}
.vrl-seg button.on{color:var(--fg);background:#26241f}
.vrl-chip{display:inline-flex;align-items:center;gap:5px;height:23px;padding:0 8px;border-radius:2px;
  border:1px solid var(--line-soft);color:var(--fg-3);font-size:11px}
.vrl-chip.on{border-color:#2f6b64;color:var(--mint)}

.vrl-panel{background:var(--surface);border-right:1px solid var(--line-soft);display:flex;flex-direction:column;min-height:0}
.vrl-row{display:flex;align-items:center;gap:8px}
.vrl-scroll{overflow-y:auto;overflow-x:hidden;min-height:0;flex:1}
.vrl-sec{border-bottom:1px solid var(--line-soft);padding:14px 16px}
.vrl-sec h4{margin:0 0 10px;font-size:11px;letter-spacing:.08em;color:var(--fg-3);font-weight:500}

.vrl-tabs{display:grid;grid-template-columns:repeat(4,1fr);border-bottom:1px solid var(--line-soft)}
.vrl-tabbtn{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;height:58px;
  color:var(--fg-3);border-bottom:2px solid transparent;border-right:1px solid var(--line-soft)}
.vrl-tabbtn:last-child{border-right:none}
.vrl-tabbtn span{font-size:10px;letter-spacing:.04em}
.vrl-tabbtn:hover{color:var(--fg-2);background:#1f1e1b}
.vrl-tabbtn.on{color:var(--fg);border-bottom-color:var(--mint);background:#211f1c}
.vrl-folder{display:flex;align-items:center;gap:10px;padding:9px 16px}
.vrl-folder-thumbs{display:flex;flex:none}
.vrl-folder-thumbs img{width:30px;height:30px;object-fit:cover;border-radius:2px;border:1px solid var(--surface);margin-left:-8px;background:var(--sunken)}
.vrl-folder-thumbs img:first-child{margin-left:0}
.vrl-lib-item{padding:12px 16px;border-bottom:1px solid var(--line-soft)}
.vrl-lib-item>img{width:100%;height:120px;object-fit:cover;border-radius:2px;background:var(--sunken);border:1px solid var(--line);display:block;margin-bottom:6px}
.vrl-list-item{display:block;width:100%;text-align:left;padding:8px 16px;border-left:2px solid transparent;color:var(--fg-2)}
.vrl-list-item:hover{background:#211f1c;color:var(--fg)}
.vrl-list-item.sel{background:#211f1c;color:var(--fg);border-left-color:var(--mint)}

.vrl-canvas{position:relative;flex:1;overflow:hidden;background:var(--ink);
  background-image:radial-gradient(circle at 1px 1px,#262320 1px,transparent 0);touch-action:none;cursor:grab}
.vrl-canvas.grabbing{cursor:grabbing}
.vrl-layer{position:absolute;top:0;left:0;transform-origin:0 0}
.vrl-node{position:absolute;background:var(--surface);border:1px solid var(--line);
  border-radius:3px;box-shadow:0 12px 30px rgba(0,0,0,.45)}
.vrl-node.drop{border-color:var(--mint);box-shadow:0 0 0 1px var(--mint),0 12px 30px rgba(0,0,0,.45)}
.vrl-ref-row{display:flex;gap:9px;align-items:flex-start;padding:7px 0;border-top:1px solid var(--line-soft)}
.vrl-ref-row:first-child{border-top:none;padding-top:0}
.vrl-ref-img{position:relative;flex:none;width:84px;height:60px;border-radius:2px;overflow:hidden;background:var(--sunken)}
.vrl-ref-img img{width:100%;height:100%;object-fit:cover;display:block}
.vrl-ref-num{position:absolute;top:3px;left:3px;min-width:16px;height:16px;padding:0 4px;border-radius:2px;
  background:rgba(16,15,13,.88);border:1px solid var(--line);font-size:9.5px;line-height:14px;text-align:center;color:var(--fg)}
.vrl-tag{display:inline-block;font-size:9.5px;letter-spacing:.05em;color:var(--fg-2);border:1px solid var(--line);
  border-radius:2px;padding:0 5px;line-height:15px;margin-bottom:3px}
.vrl-clamp2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.vrl-node-add{display:flex;align-items:center;justify-content:center;gap:5px;width:100%;height:26px;margin-top:8px;
  border:1px dashed var(--line);border-radius:2px;color:var(--fg-3);font-size:11px}
.vrl-node-add:hover{color:var(--fg);border-color:#4a453e}
.vrl-strip{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px}
.vrl-strip img{width:38px;height:28px;object-fit:cover;border-radius:2px;background:var(--sunken);border:1px solid var(--line-soft)}
.vrl-node.sel{border-color:var(--teal)}
.vrl-node.off{opacity:.42}
.vrl-node-hd{display:flex;align-items:center;gap:7px;height:30px;padding:0 9px;cursor:grab;
  border-bottom:1px solid var(--line-soft);border-left:2px solid var(--nc,#555)}
.vrl-node-hd:active{cursor:grabbing}
.vrl-node-ttl{font-size:11px;letter-spacing:.05em;color:var(--fg);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.vrl-node-bd{padding:9px;font-size:11.5px;color:var(--fg-2);line-height:1.5}
.vrl-node-bd .k{color:var(--fg-3)}
.vrl-port{position:absolute;width:11px;height:11px;border-radius:50%;background:var(--sunken);
  border:1px solid #4a453e;top:9px;cursor:crosshair;z-index:3}
.vrl-port:hover,.vrl-port.live{border-color:var(--mint);background:var(--mint)}
.vrl-port.in{left:-6px} .vrl-port.out{right:-6px}
.vrl-thumb{width:100%;height:88px;object-fit:cover;display:block;background:var(--sunken);border-radius:2px}

.vrl-modal-bg{position:absolute;inset:0;background:rgba(8,8,7,.72);display:flex;align-items:center;
  justify-content:center;padding:28px;z-index:50}
.vrl-modal{background:var(--surface);border:1px solid var(--line);border-radius:3px;
  width:100%;max-width:820px;max-height:100%;display:flex;flex-direction:column;box-shadow:0 30px 80px rgba(0,0,0,.6)}
.vrl-pre{white-space:pre-wrap;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px;
  line-height:1.62;color:var(--fg-2);background:var(--sunken);border:1px solid var(--line-soft);
  border-radius:2px;padding:16px;overflow:auto}
.vrl-tab{padding:6px 12px;color:var(--fg-3);border-bottom:1px solid transparent}
.vrl-tab.on{color:var(--fg);border-bottom-color:var(--mint)}
.vrl-hr{height:1px;background:var(--line-soft);border:0;margin:12px 0}
.vrl-sw{position:relative;width:30px;height:16px;border-radius:9px;background:#2b2825;border:1px solid var(--line);flex:none}
.vrl-sw i{position:absolute;top:1px;left:1px;width:12px;height:12px;border-radius:50%;background:#6a645b;transition:.14s}
.vrl-sw.on{background:rgba(45,210,170,.16);border-color:#2f6b64}
.vrl-sw.on i{left:15px;background:var(--mint)}
.vrl-range{-webkit-appearance:none;appearance:none;height:2px;background:#332f2a;padding:0;border:0;border-radius:0}
.vrl-range::-webkit-slider-thumb{-webkit-appearance:none;width:11px;height:11px;border-radius:50%;background:var(--sand);cursor:pointer}
.vrl-range::-moz-range-thumb{width:11px;height:11px;border:0;border-radius:50%;background:var(--sand);cursor:pointer}
.vrl-empty{color:var(--fg-3);font-size:12px;line-height:1.6}
@media (max-width:900px){ .vrl-hide-sm{display:none!important} }
`;

/* -------------------------------- i18n ---------------------------------- */

let LANG = "en";
const TH = {};   // filled below — English string → Thai
const t = (k) => (LANG === "th" && TH[k]) ? TH[k] : k;

Object.assign(TH, {
  /* toolbar / sidebar */
  "Save": "บันทึก", "Duplicate": "ทำสำเนา", "Import": "นำเข้า", "Export": "ส่งออก",
  "Generate master prompt": "สร้าง Master Prompt", "Prepare for ChatGPT": "เตรียมส่ง ChatGPT",
  "Exterior": "ภายนอก", "Interior": "ภายใน", "Add node": "เพิ่มโหนด",
  "New exterior project": "โปรเจกต์ภายนอกใหม่", "New interior project": "โปรเจกต์ภายในใหม่",
  "New preset": "พรีเซ็ตใหม่", "Add to library": "เพิ่มเข้าคลัง", "Built in": "มาตรฐาน", "Custom": "กำหนดเอง",
  "Use": "ใช้", "Remove": "ลบ", "Edit": "แก้ไข", "Fit": "จัดพอดี", "None": "ไม่มี", "no colour": "ไม่ระบุสี",
  "Interface language. Prompts are always written in English.": "ภาษาของหน้าจอ — พรอมป์เขียนเป็นภาษาอังกฤษเสมอเพื่อความแม่นยำ",
  "Switched to interior — lock, staging and lighting updated": "สลับเป็นภายใน — ปรับ lock, staging และแสงแล้ว",
  "Switched to exterior — lock, context and lighting updated": "สลับเป็นภายนอก — ปรับ lock, context และแสงแล้ว",
  "Project saved": "บันทึกโปรเจกต์แล้ว", "Project created": "สร้างโปรเจกต์แล้ว", "Project duplicated": "ทำสำเนาโปรเจกต์แล้ว",
  "Project deleted": "ลบโปรเจกต์แล้ว", "Project exported": "ส่งออกโปรเจกต์แล้ว", "Project imported": "นำเข้าโปรเจกต์แล้ว",
  "Preset saved": "บันทึกพรีเซ็ตแล้ว", "Preset duplicated": "ทำสำเนาพรีเซ็ตแล้ว", "Save preset": "บันทึกพรีเซ็ต", "Name": "ชื่อ",
  "Connected to master prompt": "เชื่อมกับ Master Prompt แล้ว", "Not connected": "ยังไม่ได้เชื่อม",
  "Master prompt": "Master Prompt", "Master": "ฉบับเต็ม", "Short": "ฉบับสั้น", "Revision": "แก้ไขรอบถัดไป",
  "Copy master prompt": "คัดลอก Master Prompt", "Copy short prompt": "คัดลอกพรอมป์สั้น", "Copy revision prompt": "คัดลอกพรอมป์แก้ไข",
  "Step 1": "ขั้นที่ 1", "Step 2": "ขั้นที่ 2", "Step 3": "ขั้นที่ 3",
  "Upload the base image to ChatGPT.": "อัปโหลด Base image เข้า ChatGPT",
  "Upload these reference images in this order.": "อัปโหลดรูป reference ตามลำดับนี้",
  "Copy the master prompt and send it with the images. Use the short prompt for fast iterations.": "คัดลอก Master Prompt แล้วส่งพร้อมรูป — ใช้พรอมป์สั้นสำหรับรอบแก้เร็วๆ",
  "Load exterior set": "โหลดชุดภายนอก", "Load interior set": "โหลดชุดภายใน",

  /* node names */
  "Base image": "ภาพต้นฉบับ", "Vessu style preset": "พรีเซ็ตสไตล์ Vessu", "Architecture lock": "ล็อกสถาปัตยกรรม",
  "Interior lock": "ล็อกงานภายใน", "Interior staging": "การจัดวางภายใน", "Reference images": "ภาพอ้างอิง",
  "Materials": "วัสดุ", "Material legend": "ตารางแปลวัสดุ", "Lighting & atmosphere": "แสงและบรรยากาศ",
  "Context": "บริบทโดยรอบ", "Negative rules": "ข้อห้าม",

  /* base */
  "Source": "ที่มาของภาพ", "Capture style": "รูปแบบการแคปเจอร์", "Project name": "ชื่อโปรเจกต์", "View name": "ชื่อมุมมอง",
  "Scene": "ประเภทฉาก",
  "New folder name": "ชื่อโฟลเดอร์ใหม่", "Folders": "โฟลเดอร์", "All folders": "โฟลเดอร์ทั้งหมด", "image": "รูป", "images": "รูป",
  "Create a folder, then add images to it. Everything here is available to every project.": "สร้างโฟลเดอร์ก่อน แล้วเพิ่มรูปเข้าไป ทุกอย่างในนี้ใช้ได้กับทุกโปรเจกต์",
  "Add images to this folder": "เพิ่มรูปเข้าโฟลเดอร์นี้", "No images in this folder yet.": "ยังไม่มีรูปในโฟลเดอร์นี้",
  "Use in this project": "ใช้ในโปรเจกต์นี้", "Move to folder": "ย้ายโฟลเดอร์", "added to": "รูปเพิ่มเข้า",
  "Add a reference node first": "เพิ่มโหนดภาพอ้างอิงก่อน", "Added to reference node": "เพิ่มเข้าโหนดภาพอ้างอิงแล้ว", "Saved to library": "บันทึกเข้าคลังแล้ว",
  "Nodes": "โหนด", "Projects": "โปรเจกต์", "Presets": "พรีเซ็ต", "Library": "คลังภาพ",
  "Add and edit nodes": "เพิ่มและแก้ไขโหนด", "Open, create, delete": "เปิด สร้าง ลบโปรเจกต์", "Vessu style presets": "พรีเซ็ตสไตล์ Vessu", "Shared references": "ภาพอ้างอิงใช้ร่วมทุกโปรเจกต์",
  "Open ChatGPT with master prompt": "เปิด ChatGPT พร้อม Master Prompt",
  "ChatGPT opened with the prompt — it is also on your clipboard": "เปิด ChatGPT พร้อมพรอมป์แล้ว — คัดลอกไว้ในคลิปบอร์ดด้วย",
  "Pop-up blocked — the prompt is on your clipboard": "เบราว์เซอร์บล็อกป๊อปอัป — พรอมป์อยู่ในคลิปบอร์ดแล้ว",
  "Open ChatGPT with the prompt pre-filled, then paste each image into the same message with Ctrl+V / ⌘V in the order shown. Send once everything is attached.": "เปิด ChatGPT ให้พรอมป์ถูกกรอกไว้ล่วงหน้า แล้ววางรูปแต่ละรูปลงในข้อความเดียวกันด้วย Ctrl+V / ⌘V ตามลำดับ ครบแล้วค่อยกดส่ง",
  "Base image — copy, then paste into ChatGPT.": "ภาพต้นฉบับ — คัดลอก แล้ววางใน ChatGPT",
  "Copy base image": "คัดลอกภาพต้นฉบับ", "Copy": "คัดลอก", "Untitled": "ไม่มีชื่อ",
  "Copied — paste in ChatGPT": "คัดลอกแล้ว — วางใน ChatGPT", "Clipboard blocked — drag the file instead": "คลิปบอร์ดถูกบล็อก — ลากไฟล์แทน",
  "Reference images — copy and paste each one, in this order.": "ภาพอ้างอิง — คัดลอกและวางทีละรูปตามลำดับนี้",
  "No base image is connected. Add a base image node and upload your clay render or SketchUp screenshot.": "ยังไม่มีภาพต้นฉบับเชื่อมอยู่ เพิ่มโหนด Base image แล้วอัปโหลด clay render หรือภาพแคป SketchUp",
  "No reference images connected. The prompt will run without them.": "ไม่มีภาพอ้างอิงเชื่อมอยู่ พรอมป์จะทำงานโดยไม่มีภาพอ้างอิง",
  "Prompt — pre-filled when you open ChatGPT from the button below; paste it manually if the box is empty. Use the short prompt for fast iterations.": "พรอมป์ — จะถูกกรอกให้เมื่อเปิด ChatGPT จากปุ่มด้านล่าง ถ้าช่องว่างให้วางเอง ใช้พรอมป์สั้นสำหรับรอบแก้เร็วๆ",
  "Next view": "มุมถัดไป", "Copy next-view prompt": "คัดลอกพรอมป์มุมถัดไป", "Step 4": "ขั้นที่ 4",
  "Send this with the next base image of the same project, in the same ChatGPT conversation, after a render you are happy with.": "ส่งพร้อม base image มุมถัดไปของโปรเจกต์เดียวกัน ในบทสนทนา ChatGPT เดิม หลังจากได้ภาพที่พอใจแล้ว",
  "For every further view of the same project: upload the next base image in the same conversation and send the next-view prompt. The accepted render becomes the reference for materials, light and entourage.": "สำหรับมุมต่อๆ ไปของโปรเจกต์เดียวกัน: อัปโหลด base image มุมใหม่ในบทสนทนาเดิม แล้วส่งพรอมป์มุมถัดไป ภาพที่ยอมรับแล้วจะกลายเป็นตัวอ้างอิงของวัสดุ แสง และองค์ประกอบ",
  "Every node that reaches this one is composed into the master prompt. Disconnect a node to leave it out without deleting it.": "ทุกโหนดที่เชื่อมถึงโหนดนี้จะถูกประกอบเป็น Master Prompt ถอดสายออกเพื่อไม่ใช้โดยไม่ต้องลบ",
  "Series consistency — carry the accepted look to later views": "ความต่อเนื่องของซีรีส์ — ส่งต่อลุคที่ยอมรับแล้วไปยังมุมถัดไป",
  "Adds section 11 to the master prompt and enables the next-view prompt. Later base images of the same project inherit materials, lighting, colour grade, entourage and photographic treatment from the render you accepted.": "เพิ่มหมวด 11 ใน Master Prompt และเปิดใช้พรอมป์มุมถัดไป base image มุมต่อๆ ไปจะรับวัสดุ แสง โทนสี องค์ประกอบ และการถ่ายภาพจากภาพที่ยอมรับแล้ว",
  "Accepted render note": "บันทึกภาพที่ยอมรับ", "e.g. main entrance view, second attempt": "เช่น มุมทางเข้าหลัก ครั้งที่สอง", "Click a surface in the base image to add its colour to the legend.": "คลิกพื้นผิวในภาพต้นฉบับเพื่อเพิ่มสีนั้นลงตาราง", "Furniture layout and light fixture positions are locked here; their appearance is rebuilt by the Interior staging node.": "ผังเฟอร์นิเจอร์และตำแหน่งโคมถูกล็อกที่นี่ ส่วนหน้าตาจะถูกสร้างใหม่โดยโหนด Interior staging", "Everything is left as drawn. Only material and light response improve.": "คงทุกอย่างตามที่วาด ปรับเฉพาะวัสดุและการตอบสนองต่อแสง", "Existing entourage is kept and raised to photographic quality.": "คงองค์ประกอบเดิม แล้วยกคุณภาพให้เหมือนภาพถ่าย", "Existing furniture and styling are kept and raised to photographic quality.": "คงเฟอร์นิเจอร์และการตกแต่งเดิม แล้วยกคุณภาพให้เหมือนภาพถ่าย", "Placeholder furniture, textiles, objects, plants, fittings and window views are detected and replaced with real ones. The room shell stays locked.": "เฟอร์นิเจอร์ ผ้า ของตกแต่ง ต้นไม้ โคม และวิวที่เป็น placeholder จะถูกตรวจจับและแทนที่ด้วยของจริง เปลือกห้องยังล็อกอยู่", "Placeholder trees, people, cars, sky and ground are detected and replaced with photographically real ones. The building stays locked.": "ต้นไม้ คน รถ ท้องฟ้า และพื้นที่เป็น placeholder จะถูกตรวจจับและแทนที่ด้วยของจริง ตัวอาคารยังล็อกอยู่", "Select a node to edit it. Drag from the right-hand dot of one node to the left-hand dot of another to connect them — only nodes that reach the master prompt node are composed.": "เลือกโหนดเพื่อแก้ไข ลากจากจุดขวาของโหนดหนึ่งไปจุดซ้ายของอีกโหนดเพื่อเชื่อม — เฉพาะโหนดที่เชื่อมถึง Master Prompt เท่านั้นที่ถูกนำไปประกอบ", "Change with the switch in the toolbar": "เปลี่ยนได้ที่สวิตช์บนแถบเครื่องมือ", "Upload": "อัปโหลด", "Replace": "เปลี่ยนรูป", "Add material legend": "เพิ่มตารางแปลวัสดุ",
  "Clay render": "Clay render", "SketchUp screenshot": "ภาพแคปจาก SketchUp", "Existing render": "ภาพเรนเดอร์เดิม",
  "Shaded with textures": "Shaded พร้อม texture", "Shaded, colour only": "Shaded เฉพาะสี", "Monochrome / white model": "โมเดลขาว",
  "Hidden line": "Hidden line", "X-ray / wireframe": "X-ray / wireframe",

  /* preset / lock */
  "Preset": "พรีเซ็ต", "Architecture lock strength": "ความเข้มของการล็อก", "Interior lock strength": "ความเข้มของการล็อก",
  "Relaxed": "ผ่อนคลาย", "Standard": "มาตรฐาน", "Strict": "เข้มงวด", "Maximum": "สูงสุด",
  "Camera angle": "มุมกล้อง", "Camera position": "ตำแหน่งกล้อง", "Perspective": "ทัศนียภาพ", "Field of view": "ระยะเลนส์",
  "Image framing": "กรอบภาพ", "Architectural massing": "มวลอาคาร", "Roof geometry": "รูปทรงหลังคา", "Floor levels": "ระดับชั้น",
  "Structural elements": "โครงสร้าง", "Columns": "เสา", "Façade proportions": "สัดส่วนผนังอาคาร", "Openings": "ช่องเปิด",
  "Window locations": "ตำแหน่งหน้าต่าง", "Door locations": "ตำแหน่งประตู", "Balcony geometry": "รูปทรงระเบียง",
  "Landscape geometry where applicable": "ผังภูมิทัศน์ (ถ้ามี)", "Do not crop": "ห้ามตัดภาพ", "Do not redesign": "ห้ามออกแบบใหม่",
  "Room volume and proportions": "ปริมาตรและสัดส่วนห้อง", "Wall and partition positions": "ตำแหน่งผนังและพาร์ทิชัน",
  "Ceiling height and ceiling design": "ความสูงและดีไซน์ฝ้า", "Floor level and steps": "ระดับพื้นและขั้นบันได",
  "Window and door positions and sizes": "ตำแหน่งและขนาดช่องเปิด", "Columns and beams": "เสาและคาน",
  "Built-in joinery and fixed millwork": "งานบิลท์อิน", "Sanitaryware, kitchen and fixed equipment": "สุขภัณฑ์ ครัว และอุปกรณ์ติดตั้งถาวร",
  "Light fixture positions": "ตำแหน่งดวงโคม", "Floor and ceiling pattern layout": "แพทเทิร์นพื้นและฝ้า",
  "Furniture layout and footprints": "ผังและขนาดเฟอร์นิเจอร์",

  /* reference / material / legend */
  "Add reference": "เพิ่มภาพอ้างอิง", "Add image": "เพิ่มรูป", "From library": "จากคลัง", "Category": "หมวด", "Title": "ชื่อ",
  "Instruction": "คำสั่ง", "Save to library": "บันทึกเข้าคลัง",
  "Material": "วัสดุ", "Lighting": "แสง", "Atmosphere": "บรรยากาศ", "Landscape": "ภูมิทัศน์", "Furniture": "เฟอร์นิเจอร์",
  "Color tone": "โทนสี", "Façade detail": "รายละเอียดผนังอาคาร", "Interior detail": "รายละเอียดภายใน", "Photography style": "สไตล์ภาพถ่าย",
  "Add material": "เพิ่มวัสดุ", "Element": "องค์ประกอบ", "Current material": "วัสดุปัจจุบัน", "Target material": "วัสดุที่ต้องการ",
  "Reference image": "ภาพอ้างอิง", "Finish": "ผิวสำเร็จ", "Texture scale": "สเกล texture", "Roughness": "ความหยาบ", "Reflectivity": "การสะท้อน",
  "Add by element": "เพิ่มตามองค์ประกอบ", "Fallback material for anything unlisted": "วัสดุสำรองสำหรับผิวที่ไม่ได้ระบุ",
  "Include capture-reading guards in the prompt": "ใส่กฎกันอ่านภาพผิดลงในพรอมป์",
  "Appears in capture as": "ปรากฏในภาพเป็น", "Where it appears": "ตำแหน่งที่พบ", "Real material": "วัสดุจริง", "Module or size": "โมดูลหรือขนาด", "Note": "หมายเหตุ",

  /* lighting */
  "Time": "เวลา", "Brightness": "ความสว่าง", "Contrast": "คอนทราสต์", "Warmth": "ความอบอุ่น", "Interior visibility": "การมองเห็นภายในผ่านกระจก",
  "View visibility through glazing": "การมองเห็นวิวผ่านกระจก", "Shadow softness": "ความนุ่มของเงา", "Sun intensity": "ความแรงแดด",
  "Light direction": "ทิศทางแสง", "Ambient description": "แสงแวดล้อม", "Weather": "สภาพอากาศ", "Sky description": "ท้องฟ้า",
  "Morning": "เช้า", "Golden hour": "Golden hour", "Evening": "เย็น", "Blue hour": "Blue hour", "Night": "กลางคืน",
  "Daylight": "แสงธรรมชาติ", "Direct sun patches through openings": "แดดส่องเป็นหย่อมผ่านช่องเปิด", "Sun patch softness": "ความนุ่มของขอบแดด",
  "Exterior view exposure": "ความสว่างของวิวภายนอก", "Blinds and curtains": "มู่ลี่และม่าน",
  "Open": "เปิด", "Sheer only": "ม่านโปร่งอย่างเดียว", "Half closed": "ปิดครึ่ง", "Closed": "ปิด",
  "Daylight ↔ artificial balance": "สมดุลแสงธรรมชาติ ↔ แสงประดิษฐ์",
  "Artificial light": "แสงประดิษฐ์", "Amount of lighting design": "ปริมาณการออกแบบแสง", "Colour temperature": "อุณหภูมิสี",
  "Fixture types allowed": "ประเภทโคมที่อนุญาต", "Lighting notes": "หมายเหตุเรื่องแสง",
  "Anything switched off is written into the prompt as prohibited unless it is physically modelled in the base image.": "รายการที่ปิดจะถูกเขียนลงพรอมป์ว่า “ห้ามใช้” เว้นแต่มีโมเดลอยู่ในภาพต้นฉบับจริง",
  "Pendants over the dining table only; wall lights dimmed low": "โคมห้อยเฉพาะเหนือโต๊ะอาหาร ไฟผนังหรี่ต่ำ",
  "Off — daylight only": "ปิด — ใช้แสงธรรมชาติอย่างเดียว", "As drawn — fixtures on": "ตามที่วาด — เปิดเฉพาะโคมที่มีในภาพ",
  "As drawn plus subtle fill": "ตามที่วาด + fill เบาๆ", "Designed scheme — restrained": "ออกแบบแสงเพิ่ม — แบบยั้ง", "Designed scheme — full": "ออกแบบแสงเพิ่ม — เต็มรูปแบบ",
  "All artificial lighting is switched off. The room is lit by daylight alone. Fixtures visible in the base image remain visible but unlit.": "ปิดแสงประดิษฐ์ทั้งหมด ห้องสว่างด้วยแสงธรรมชาติอย่างเดียว โคมที่มีในภาพยังอยู่แต่ไม่ติด",
  "Only the light fittings that are actually modelled in the base image emit light. Do not add any fixture or any light source that is not visible.": "เฉพาะโคมที่มีโมเดลอยู่ในภาพต้นฉบับเท่านั้นที่เปล่งแสง ห้ามเพิ่มโคมหรือแหล่งแสงที่มองไม่เห็น",
  "Fixtures modelled in the base image emit light. A small amount of unobtrusive fill from those same fixtures is acceptable. No new fixtures or light sources.": "โคมในภาพเปล่งแสง ยอมให้มี fill เบาๆ จากโคมเดิมได้ แต่ห้ามเพิ่มโคมหรือแหล่งแสงใหม่",
  "A restrained interior-lighting scheme may be added, limited to the permitted fixture types below, placed where an interior designer would place them, few in number, and visible as real fittings.": "เพิ่มแสงได้แบบยั้งมือ จำกัดเฉพาะประเภทโคมที่อนุญาตด้านล่าง วางในตำแหน่งที่นักออกแบบภายในจะวางจริง จำนวนน้อย และต้องเห็นเป็นโคมจริง",
  "A complete interior-lighting scheme may be added using the permitted fixture types below. Every added light must appear as a physical fitting in the image; nothing glows without a source.": "เพิ่มแสงได้เต็มรูปแบบตามประเภทโคมที่อนุญาต ทุกแสงที่เพิ่มต้องปรากฏเป็นโคมจริงในภาพ ไม่มีอะไรเรืองแสงโดยไม่มีแหล่งกำเนิด",
  "Cove / indirect ceiling light": "ไฟหลืบ / ไฟซ่อนฝ้า", "Recessed downlights": "ดาวน์ไลท์ฝัง", "Linear ceiling light": "ไฟเส้นฝ้า",
  "Pendants": "โคมห้อย", "Wall lights": "ไฟผนัง", "Floor and table lamps": "โคมตั้งพื้น/ตั้งโต๊ะ",
  "Accent spots on art and joinery": "สปอตไลท์ส่องงานศิลป์และบิลท์อิน", "Under-cabinet / shelf light": "ไฟใต้ตู้ / ใต้ชั้น",
  "artificial-led": "แสงประดิษฐ์นำ", "artificial with fill": "แสงประดิษฐ์ + fill", "balanced": "สมดุล", "daylight-led": "แสงธรรมชาตินำ", "daylight only": "แสงธรรมชาติล้วน",
  "hard-edged": "ขอบคม", "fairly crisp": "ค่อนข้างคม", "moderately soft": "นุ่มปานกลาง", "soft": "นุ่ม", "very soft": "นุ่มมาก",
  "dark": "มืด", "darker than room": "มืดกว่าห้อง", "brighter than room": "สว่างกว่าห้อง", "near white": "เกือบขาว",

  /* context / staging */
  "Location and context": "สถานที่และบริบท", "People": "คน", "Cars": "รถ", "Street activity": "ความเคลื่อนไหวบนถนน",
  "Interior activity": "ความเคลื่อนไหวภายใน", "Landscape enhancement": "การเสริมภูมิทัศน์", "Non-architectural elements": "องค์ประกอบที่ไม่ใช่อาคาร",
  "Keep original positions and scale": "คงตำแหน่งและสเกลเดิม", "Keep original positions and footprints": "คงตำแหน่งและ footprint เดิม",
  "Rebuild photorealistically": "สร้างใหม่ให้เหมือนภาพถ่าย", "Enhance in place": "ยกคุณภาพของเดิม", "Keep as drawn": "คงตามที่วาด",
  "Trees, shrubs and ground cover": "ต้นไม้ พุ่มไม้ และไม้คลุมดิน", "Vehicles": "ยานพาหนะ", "Sky and clouds": "ท้องฟ้าและเมฆ",
  "Ground, paving and road surface": "พื้น ทางเท้า และผิวถนน", "Water": "น้ำ", "Surrounding buildings and distant context": "อาคารรอบข้างและบริบทไกล",
  "Street furniture and signage": "Street furniture และป้าย",
  "Room use": "ประเภทห้อง", "Program and brief": "โปรแกรมและโจทย์", "View through openings": "วิวผ่านช่องเปิด", "Occupancy": "จำนวนผู้ใช้งาน",
  "Lived-in level": "ระดับความมีชีวิต", "Styling density": "ความหนาแน่นของการตกแต่ง", "Furniture, styling and occupancy": "เฟอร์นิเจอร์ การตกแต่ง และผู้ใช้งาน",
  "Furniture policy": "นโยบายเฟอร์นิเจอร์", "Keep silhouette, rebuild as real product": "คงรูปทรง แล้วสร้างเป็นสินค้าจริง",
  "Restyle freely within footprint": "เปลี่ยนสไตล์ได้อิสระใน footprint เดิม",
  "Loose furniture": "เฟอร์นิเจอร์ลอยตัว", "Soft furnishings": "ผ้า พรม ม่าน", "Décor and accessories": "ของตกแต่ง", "Artwork and wall décor": "งานศิลปะและของแขวนผนัง",
  "Indoor plants": "ต้นไม้ในร่ม", "People and occupancy": "คนและการใช้งาน", "Light fittings": "ดวงโคม", "View through windows": "วิวนอกหน้าต่าง",
  "Floors, walls and ceilings": "พื้น ผนัง ฝ้า", "Glass, mirrors and polished surfaces": "กระจก กระจกเงา และผิวเงา",
  "Lobby / reception": "ล็อบบี้ / ต้อนรับ", "Waiting area": "พื้นที่รอ", "Corridor": "ทางเดิน", "Patient room": "ห้องผู้ป่วย", "Ward": "หอผู้ป่วย",
  "Consultation room": "ห้องตรวจ", "Operating / treatment room": "ห้องผ่าตัด / รักษา", "Office / workspace": "สำนักงาน", "Meeting room": "ห้องประชุม",
  "Living room": "ห้องนั่งเล่น", "Dining room": "ห้องอาหาร", "Kitchen": "ครัว", "Bedroom": "ห้องนอน", "Bathroom": "ห้องน้ำ",
  "Restaurant / café": "ร้านอาหาร / คาเฟ่", "Retail": "ร้านค้า", "Hotel guest room": "ห้องพักโรงแรม", "Other": "อื่นๆ",

  /* revision */
  "Revision type": "ประเภทการแก้ไข", "What exactly should change": "ต้องการเปลี่ยนอะไรบ้าง",
  "Material only": "เฉพาะวัสดุ", "Lighting only": "เฉพาะแสง", "Landscape only": "เฉพาะภูมิทัศน์", "Atmosphere only": "เฉพาะบรรยากาศ",
  "Furniture only": "เฉพาะเฟอร์นิเจอร์", "Décor and styling only": "เฉพาะของตกแต่ง", "View through windows only": "เฉพาะวิวนอกหน้าต่าง",
  "Object replacement": "เปลี่ยนวัตถุชิ้นเดียว", "Fix distortion": "แก้ภาพบิดเบี้ยว", "Increase realism": "เพิ่มความสมจริง",
});


/* ------------------------------ node schema ------------------------------ */

const NT = {
  base:      { label: "Base image",         color: "#c9c0ad" },
  preset:    { label: "Vessu style preset", color: "#2dd2aa" },
  lock:      { label: "Architecture lock",  color: "#c86a5a" },
  ilock:     { label: "Interior lock",      color: "#d8907e" },
  staging:   { label: "Interior staging",   color: "#7fb2c4" },
  reference: { label: "Reference images",   color: "#3f9db0" },
  material:  { label: "Materials",          color: "#c9b76a" },
  legend:    { label: "Material legend",    color: "#b39b6e" },
  lighting:  { label: "Lighting & atmosphere", color: "#e2c890" },
  context:   { label: "Context",            color: "#4a7f9e" },
  negative:  { label: "Negative rules",     color: "#8a7f74" },
  revision:  { label: "Revision",           color: "#b4e99b" },
  output:    { label: "Master prompt",      color: "#e9e5dd" },
};

const SCENE_NODES = {
  Exterior: ["base", "preset", "lock", "reference", "legend", "material", "lighting", "context", "negative", "revision"],
  Interior: ["base", "preset", "ilock", "reference", "legend", "material", "lighting", "staging", "negative", "revision"],
};

const NODE_W = (t) => (t === "reference" || t === "base" || t === "material" ? 300 : 248);

const LOCK_FLAGS = [
  ["cameraAngle", "Camera angle"], ["cameraPosition", "Camera position"],
  ["perspective", "Perspective"], ["fov", "Field of view"], ["framing", "Image framing"],
  ["massing", "Architectural massing"], ["roof", "Roof geometry"], ["floors", "Floor levels"],
  ["structure", "Structural elements"], ["columns", "Columns"], ["facade", "Façade proportions"],
  ["openings", "Openings"], ["windows", "Window locations"], ["doors", "Door locations"],
  ["balcony", "Balcony geometry"], ["landscape", "Landscape geometry where applicable"],
  ["noCrop", "Do not crop"], ["noRedesign", "Do not redesign"],
];
const LOCK_STRENGTH = ["Relaxed", "Standard", "Strict", "Maximum"];
const STRENGTH_NOTE = {
  Relaxed: "Minor interpretive latitude is acceptable where it improves realism, but the building must remain recognisably the same design.",
  Standard: "Follow the lock list closely. Small refinements are acceptable only where they do not change any measurable relationship.",
  Strict: "Treat the lock list as binding. Every listed element must match the base image exactly.",
  Maximum: "Treat the lock list as absolute. If any instruction elsewhere in this prompt would alter a locked element, ignore that instruction and keep the base image geometry. Geometry fidelity outranks visual appeal.",
};

const REF_CATEGORIES = ["Material", "Lighting", "Atmosphere", "Landscape", "Furniture",
  "Color tone", "Façade detail", "Interior detail", "Photography style"];

const TIME_PRESETS = ["Morning", "10:00", "14:00", "15:00", "Golden hour", "Evening", "Blue hour", "Night"];

const DEFAULT_NEGATIVES = [
  "Do not redesign the building", "Do not move windows", "Do not alter roof geometry",
  "Do not add extra floors", "Do not change camera angle", "Do not distort proportions",
  "Do not crop the original image", "Do not copy architecture from reference images",
  "Do not create fake façade elements", "Avoid excessive HDR", "Avoid oversaturation",
  "Avoid unrealistic glass", "Avoid distorted humans",
];

const REVISION_MODES = ["Material only", "Lighting only", "Landscape only", "Atmosphere only",
  "Furniture only", "Décor and styling only", "View through windows only",
  "Object replacement", "Fix distortion", "Increase realism"];

/* ------------------------ reading a SketchUp capture ------------------------ */

const CAPTURE_STYLES = ["Shaded with textures", "Shaded, colour only", "Monochrome / white model", "Hidden line", "X-ray / wireframe"];

const CAPTURE_READING = {
  "Shaded with textures":
    "The base image shows SketchUp textures. Every texture is a placeholder that identifies a material category only — its colour, scale, repeat pattern and sharpness are wrong and must not be reproduced. A SketchUp wood texture means \"timber of the type given in the legend\", not that particular grain image.",
  "Shaded, colour only":
    "The base image shows flat face colours with no texture. Each colour is a code for a material, defined in the legend below. Never render a flat colour as painted plastic, powder-coated metal or coloured render unless the legend says so.",
  "Monochrome / white model":
    "The base image is a white or clay model. Surface colour carries no material information at all; read materials from the legend by element and location, and from the material instructions. Where nothing is specified, default to the fallback material.",
  "Hidden line":
    "The base image is a line drawing. Read geometry from the lines and materials only from the legend and instructions. Do not render line weight as physical edges, joints or shadow gaps.",
  "X-ray / wireframe":
    "The base image shows transparent faces. Treat every surface as opaque unless the legend or instructions state that it is glass. Ignore the see-through appearance entirely.",
};

const CAPTURE_GUARDS = [
  "Flat mid-grey faces mean \"unassigned\", not grey paint and never grey plastic — consult the legend, then the fallback material.",
  "Pure white faces are SketchUp's default material and mean \"not yet assigned\"; they do not mean white paint unless the legend says so.",
  "Light-blue or blue-tinted transparent faces are clear glass — not tinted, mirrored or coloured glass.",
  "Black edge lines and profile outlines are display artefacts. Do not render them as dark seams, control joints, metal trims or shadow gaps.",
  "SketchUp's hard black shadows are a display setting, not a lighting instruction. Take lighting only from section 6.",
  "The background or sky colour of the capture is not the intended sky.",
  "Texture scale in the capture is arbitrary. Use real-world module sizes: brick 215×65 mm, standard tile 600×600 mm, timber board 90–140 mm wide, and so on, unless the legend gives a size.",
  "Texture seams, tiling repeats and stretched UV mapping are artefacts. Materials must be continuous and correctly scaled on every face.",
  "Where two adjacent faces share a colour, they share a material; where a single element shows two colours by mistake, use the legend entry for that element and ignore the stray colour.",
  "If a colour or texture is not in the legend, choose the most plausible material from the style preset's vocabulary, keep it matte and neutral, and never invent a strongly coloured or glossy finish.",
];

function hexToName(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || "");
  if (!m) return "";
  const n = parseInt(m[1], 16);
  const r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  if (s < 0.1) {
    const tone = r - b > 0.03 ? "warm " : b - r > 0.03 ? "cool " : "";
    if (l > 0.92) return `${tone}white`;
    if (l > 0.72) return `light ${tone}grey`;
    if (l > 0.45) return `mid ${tone}grey`;
    if (l > 0.2) return `dark ${tone}grey`;
    return "near-black";
  }
  const hue = h < 15 || h >= 345 ? "red" : h < 40 ? "orange" : h < 65 ? "yellow" : h < 160 ? "green"
    : h < 200 ? "cyan" : h < 255 ? "blue" : h < 290 ? "violet" : "magenta";
  const brownish = (hue === "orange" || hue === "yellow" || hue === "red") && l < 0.45 && s < 0.6;
  const base = brownish ? "brown" : hue;
  const lv = l > 0.8 ? "pale " : l > 0.6 ? "light " : l < 0.3 ? "dark " : "";
  const sv = s > 0.65 && !brownish ? "saturated " : s < 0.3 ? "muted " : "";
  return `${lv}${sv}${base}`.trim();
}

const ENTOURAGE_MODES = ["Rebuild photorealistically", "Enhance in place", "Keep as drawn"];

const ENTOURAGE = [
  ["vegetation", "Trees, shrubs and ground cover",
    "Replace every proxy, cut-out or low-polygon plant with a real species suited to the setting — correct branching, leaf density, translucency in backlight, natural asymmetry, and cast shadows that agree with the sun direction stated above."],
  ["people", "People",
    "Replace placeholder figures with real people at correct scale, in clothing appropriate to the place, climate and building use. Vary age, posture and direction of travel. Slight motion blur on anyone walking. No two figures identical, no figure looking at the camera."],
  ["vehicles", "Vehicles",
    "Replace symbolic cars with real vehicles of types plausible for the location, correctly parked or in motion, with accurate paint reflection, glazing, wheel contact and ground shadow."],
  ["sky", "Sky and clouds",
    "Replace any blank or default sky with a real sky matching the stated time of day and weather — correct cloud type, height, edge softness and illumination from the same sun direction."],
  ["ground", "Ground, paving and road surface",
    "Keep the paving layout and joint pattern from the base image, but rebuild the surface itself photographically — real aggregate, tone variation, wear along traffic lines, damp patches, dust and debris where plausible."],
  ["water", "Water",
    "Render pools, ponds and wet surfaces with physically correct reflection, refraction, depth falloff and surface disturbance."],
  ["distant", "Surrounding buildings and distant context",
    "Resolve neighbouring buildings and the far context into real structures with plausible materials, window detail and rooftop services, softened by atmospheric perspective. Do not invent new buildings on the site itself."],
  ["furniture", "Street furniture and signage",
    "Render bollards, lamp posts, bins, benches, planters, railings and signage as real manufactured objects at correct scale. Keep all signage generic and unbranded."],
];

/* ------------------------------ interior ------------------------------- */

const ILOCK_FLAGS = [
  ["cameraAngle", "Camera angle"], ["cameraPosition", "Camera position"], ["perspective", "Perspective"],
  ["fov", "Field of view"], ["framing", "Image framing"],
  ["volume", "Room volume and proportions"], ["walls", "Wall and partition positions"],
  ["ceiling", "Ceiling height and ceiling design"], ["floorLevel", "Floor level and steps"],
  ["openings", "Window and door positions and sizes"], ["structure", "Columns and beams"],
  ["joinery", "Built-in joinery and fixed millwork"], ["fixedFixtures", "Sanitaryware, kitchen and fixed equipment"],
  ["lightLayout", "Light fixture positions"], ["floorPattern", "Floor and ceiling pattern layout"],
  ["furnitureLayout", "Furniture layout and footprints"],
  ["noCrop", "Do not crop"], ["noRedesign", "Do not redesign"],
];

const STAGING_MODES = ["Rebuild photorealistically", "Enhance in place", "Keep as drawn"];
const FURNITURE_POLICIES = ["Keep silhouette, rebuild as real product", "Restyle freely within footprint", "Keep as drawn"];

const STAGING = [
  ["furniture", "Loose furniture",
    "Rebuild every piece as a real manufactured product — correct upholstery weave, timber grain, metal finish, visible stitching, cushion compression where someone has sat. Legs touch the floor with a contact shadow."],
  ["soft", "Soft furnishings",
    "Cushions, throws, rugs, curtains and bedding as real textiles with weight, drape, weave and slight creasing. Curtains hang from real tracks or rods; rugs lie flat with a visible pile and a soft edge shadow."],
  ["decor", "Décor and accessories",
    "Replace placeholder objects with a small, specific set of real objects appropriate to the room use — ceramics, books, tableware, stationery, a folded newspaper — at correct scale, never in symmetrical showroom groupings, never more than a real occupant would own."],
  ["art", "Artwork and wall décor",
    "Render frames, canvases and wall pieces as real objects with glazing reflection, mat boards, hanging hardware and a shadow gap. Content abstract or generic — never a recognisable existing artwork or brand."],
  ["plants", "Indoor plants",
    "Real species suited to the room's light level, in real planters with visible soil or moss, natural asymmetry and a few imperfect leaves."],
  ["people", "People and occupancy",
    "Real people at correct scale doing what the room is for, dressed for the building use and climate. Varied posture, some seated, slight motion blur on anyone moving, nobody looking at the camera."],
  ["fixtures", "Light fittings",
    "Keep every fixture position from the base image; render each as a real manufactured luminaire with correct housing, diffuser, lamp colour, and exactly the light it would physically emit — no glow without a source."],
  ["view", "View through windows",
    "Replace blank or diagrammatic glazing with a real exterior view consistent with the stated context, time of day and floor level, exposed brighter than the interior and softened by glass reflection and slight haze."],
  ["surfaces", "Floors, walls and ceilings",
    "Keep every layout, pattern and level; rebuild surfaces as real materials — grout lines, sheen variation, skirting shadows, slight wall imperfection, ceiling texture, wear at thresholds."],
  ["reflections", "Glass, mirrors and polished surfaces",
    "Physically correct reflections that agree with the room geometry and the camera position. Mirrors show the real room behind the camera, never an invented scene."],
];

const ARTIFICIAL_LEVELS = [
  ["off", "Off — daylight only", "All artificial lighting is switched off. The room is lit by daylight alone. Fixtures visible in the base image remain visible but unlit."],
  ["asdrawn", "As drawn — fixtures on", "Only the light fittings that are actually modelled in the base image emit light. Do not add any fixture or any light source that is not visible."],
  ["fill", "As drawn plus subtle fill", "Fixtures modelled in the base image emit light. A small amount of unobtrusive fill from those same fixtures is acceptable. No new fixtures or light sources."],
  ["restrained", "Designed scheme — restrained", "A restrained interior-lighting scheme may be added, limited to the permitted fixture types below, placed where an interior designer would place them, few in number, and visible as real fittings."],
  ["full", "Designed scheme — full", "A complete interior-lighting scheme may be added using the permitted fixture types below. Every added light must appear as a physical fitting in the image; nothing glows without a source."],
];

const FIXTURE_TYPES = [
  ["cove", "Cove / indirect ceiling light",
    "cove, slot, trough, LED-strip and indirect ceiling light"],
  ["downlight", "Recessed downlights", "recessed downlights"],
  ["linear", "Linear ceiling light", "surface or recessed linear luminaires"],
  ["pendant", "Pendants", "pendant luminaires"],
  ["wall", "Wall lights", "wall-mounted luminaires"],
  ["lamp", "Floor and table lamps", "floor and table lamps"],
  ["accent", "Accent spots on art and joinery", "adjustable accent spotlights on artwork and joinery"],
  ["underCabinet", "Under-cabinet / shelf light", "under-cabinet, under-shelf and joinery-integrated light"],
];

const BLIND_STATES = ["Open", "Sheer only", "Half closed", "Closed"];
const CCT_OPTIONS = ["2700K", "3000K", "3500K", "4000K"];

const ROOM_USES = ["Lobby / reception", "Waiting area", "Corridor", "Patient room", "Ward", "Consultation room",
  "Operating / treatment room", "Office / workspace", "Meeting room", "Living room", "Dining room", "Kitchen",
  "Bedroom", "Bathroom", "Restaurant / café", "Retail", "Hotel guest room", "Other"];

const INTERIOR_NEGATIVES = [
  "Do not move walls, partitions or openings", "Do not change ceiling height or ceiling design",
  "Do not relocate built-in joinery or fixed fixtures", "Do not change the furniture layout or footprints",
  "Do not change camera angle or lens", "Do not crop the original image",
  "Do not copy geometry from reference images", "Avoid fisheye or over-wide distortion",
  "Avoid showroom gloss and mirrored floors", "Avoid oversaturated or magazine-HDR look",
  "Avoid symmetrical staged prop groupings", "Avoid light glow without a real fixture",
  "Do not add cove, slot, trough or LED-strip light that is not modelled in the base image",
  "Avoid distorted humans or hands", "Avoid recognisable artworks, brands or logos",
];

/* ------------------------------- presets --------------------------------- */

const BUILTIN_PRESETS = [
  {
    id: "p-ext-day", builtin: true, name: "VESSU MASTER EXTERIOR DAY",
    visual: "Calm architectural photography of a built work in soft mid-morning daylight. Warm neutral palette — matte plaster, light-toned timber, fine metal mullions. Composition reads as a finished building documented by an architectural photographer, not as a visualisation.",
    material: "Physically plausible materials with visible surface grain. Plaster slightly uneven, timber with legible figure, concrete with fine formwork texture, brass and metalwork brushed rather than mirror-polished. Reflections restrained and directional.",
    lighting: "Ambient daylight with soft, lifted shadows. No harsh contrast, no blown highlights. Sun low enough to model the massing, high enough to keep façades open. Interiors read faintly through glazing.",
    photography: "Full-frame camera, 24–35mm equivalent, verticals corrected, natural depth of field. Colour graded warm-neutral with a gentle film response. No HDR halos, no heavy vignette.",
    landscaping: "Tropical planting appropriate to Thailand — layered ground cover, medium shrubs, mature canopy trees. Planting reads as maintained, not wild. Paving joints and edges resolved.",
    realism: "Every surface should behave as a real material under real light. Grain, dust, subtle unevenness and honest imperfection are preferred over polish.",
    negative: "No lens flare, no rainbow gradients, no oversaturated greens, no glowing edges, no plastic-looking glass.",
  },
  {
    id: "p-ext-eve", builtin: true, name: "VESSU MASTER EXTERIOR EVENING",
    visual: "Early-evening architectural photograph at the balance point where interior light and remaining sky light are equal. Quiet, warm, inhabited. The building reads as occupied rather than staged.",
    material: "Materials read by reflected and emitted light. Warm interior spill on plaster and timber, cool residual sky on upward-facing surfaces. Metals catch narrow specular lines.",
    lighting: "Blue-hour ambient with warm interior illumination at 2700–3000K. Landscape and soffit lighting used sparingly and only where a real lighting design would place it. No uniform glow.",
    photography: "Tripod exposure, long-ish shutter, verticals corrected. Slight highlight roll-off in lit interiors. Shadows retain colour rather than going black.",
    landscaping: "Planting silhouetted against lit surfaces; ground-level lighting grazing textures rather than flooding them.",
    realism: "Light must fall off with distance. Fixtures must be plausible in number, position and output.",
    negative: "No neon, no purple sky, no over-lit façade, no unmotivated light sources, no daylight shadows in an evening scene.",
  },
  {
    id: "p-int", builtin: true, name: "VESSU MASTER INTERIOR",
    visual: "Interior architectural photograph with generous daylight, calm neutral tones and restrained furnishing. Japanese–Scandinavian–tropical register: matte plaster, washed oak, terrazzo, fluted glass, brushed brass.",
    material: "Honest finishes with legible texture. Matte paint, natural timber grain, terrazzo aggregate visible at close range, fabric with weave. Reflectivity low to moderate throughout.",
    lighting: "Daylight-led, entering from the real window positions in the base image. Artificial light warm and secondary. Shadows soft and lifted; no hard pools.",
    photography: "16–24mm equivalent, one-point or gentle two-point perspective, verticals corrected, natural white balance with a warm bias.",
    landscaping: "Interior planting limited and specific — one or two well-chosen species in appropriate vessels. Views to exterior greenery where openings allow.",
    realism: "Furniture at correct human scale. Reflections in glass and stone consistent with room geometry. Ceiling services resolved rather than omitted.",
    negative: "No showroom gloss, no mirrored floors, no random decorative objects, no ceiling light spill without a fixture.",
  },
  {
    id: "p-hosp", builtin: true, name: "VESSU CONTEMPORARY HOSPITAL",
    visual: "Healthcare architecture with the calm of a home and the clarity of a clinic. Warm neutral surfaces, generous daylight, clear wayfinding, no institutional coldness.",
    material: "Hygienic but warm: seamless resin or homogeneous tile floors, matte wall finishes, timber-look accents, solid-surface counters. All junctions coved or cleanly detailed.",
    lighting: "Even, comfortable illumination with daylight prioritised. Indirect ceiling light, no glare into patient eye lines, colour temperature 3500–4000K.",
    photography: "Eye-level, calm, symmetrical where the plan is symmetrical. Neutral-warm grade. Depth of field wide enough to keep wayfinding legible.",
    landscaping: "Courtyard and terrace planting visible through glazing; healing-garden species, layered and soft.",
    realism: "Clinical equipment, handrails, signage and door hardware must be plausible and correctly sized. Staff and patients depicted with dignity and appropriate attire.",
    negative: "No sterile blue-white light, no empty lifeless corridors, no medical equipment invented at incorrect scale, no glossy hospital-brochure sheen.",
  },
  {
    id: "p-mk27", builtin: true, name: "VESSU MK27 TROPICAL",
    visual: "Tropical modernism in the Studio MK27 register — long horizontal planes, deep overhangs, timber screens, white concrete, water and shadow used as material.",
    material: "Board-formed and smooth white concrete, warm hardwood battens and decking, natural stone, large clear glazing with minimal framing. Water surfaces still and reflective.",
    lighting: "Strong tropical sun producing crisp but not black shadows. Deep shade under overhangs with bounced light lifting the underside of soffits.",
    photography: "Wide horizontal framing, low camera height, generous sky. Graded slightly cool in shade, warm in sun.",
    landscaping: "Lush tropical planting — palms, monstera, heliconia, mature canopy — set against clean architectural planes for contrast.",
    realism: "Timber batten spacing consistent and correctly scaled. Water reflections geometrically correct. Concrete showing real formwork tolerance.",
    negative: "No resort-brochure styling, no infinity-pool clichés, no tropical postcard saturation, no palm trees pasted at wrong scale.",
  },
];

/* ----------------------------- storage layer ----------------------------- */

const MEM = new Map();
const store = {
  async get(key) {
    try {
      if (typeof window !== "undefined" && window.storage) {
        const r = await window.storage.get(key, false);
        return r ? JSON.parse(r.value) : null;
      }
      if (typeof localStorage !== "undefined") {
        const v = localStorage.getItem(key);
        return v ? JSON.parse(v) : null;
      }
    } catch { /* missing key or quota — treat as absent */ }
    const v = MEM.get(key);
    return v === undefined ? null : v;
  },
  async set(key, value) {
    try {
      if (typeof window !== "undefined" && window.storage) {
        await window.storage.set(key, JSON.stringify(value), false);
        return true;
      }
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      }
    } catch { MEM.set(key, value); return false; }
    MEM.set(key, value);
    return true;
  },
  async del(key) {
    try {
      if (typeof window !== "undefined" && window.storage) await window.storage.delete(key, false);
      else if (typeof localStorage !== "undefined") localStorage.removeItem(key);
    } catch { /* already gone */ }
    MEM.delete(key);
  },
};
const K = {
  index: "vrl:index", proj: (id) => `vrl:proj:${id}`, img: (id) => `vrl:img:${id}`,
  presets: "vrl:presets", reflib: "vrl:reflib",
};

/* -------------------------------- utils ---------------------------------- */

const uid = (p = "n") => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function fileToDataURL(file, maxPx = 1600, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onerror = () => reject(new Error("Could not read the file"));
    fr.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not decode the image"));
      img.onload = () => {
        const s = Math.min(1, maxPx / Math.max(img.width, img.height));
        const w = Math.round(img.width * s), h = Math.round(img.height * s);
        const c = document.createElement("canvas");
        c.width = w; c.height = h;
        const ctx = c.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        resolve(c.toDataURL("image/jpeg", quality));
      };
      img.src = fr.result;
    };
    fr.readAsDataURL(file);
  });
}

async function copyText(t) {
  try { await navigator.clipboard.writeText(t); return true; }
  catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = t; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      const ok = document.execCommand("copy"); document.body.removeChild(ta); return ok;
    } catch { return false; }
  }
}

async function copyImage(dataURL) {
  try {
    if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") return false;
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = dataURL; });
    const c = document.createElement("canvas"); c.width = img.naturalWidth; c.height = img.naturalHeight;
    c.getContext("2d").drawImage(img, 0, 0);
    const blob = await new Promise((res) => c.toBlob(res, "image/png"));
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    return true;
  } catch { return false; }
}

function openChatGPT(prompt) {
  const url = `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;
  const w = window.open(url, "_blank", "noopener");
  return !!w;
}

function downloadJSON(name, obj) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

const word = (v, scale) => scale[clamp(Math.floor(v / 20), 0, 4)];
const S_LOW = ["very low", "low", "moderate", "high", "very high"];
const S_AMT = ["none", "sparse", "moderate", "busy", "very busy"];

/* ----------------------------- node factory ------------------------------ */

function newNode(type, x, y) {
  const base = { id: uid(type), type, x, y };
  switch (type) {
    case "base": return { ...base, data: { projectName: "", viewName: "", space: "Exterior", imageId: null, source: "Clay render", captureStyle: "Shaded with textures" } };
    case "legend": return { ...base, data: { items: [], fallback: "matte off-white plaster", guards: true } };
    case "preset": return { ...base, data: { presetId: "p-ext-day" } };
    case "lock": return { ...base, data: { flags: Object.fromEntries(LOCK_FLAGS.map(([k]) => [k, true])), strength: "Maximum" } };
    case "ilock": return { ...base, data: { flags: Object.fromEntries(ILOCK_FLAGS.map(([k]) => [k, true])), strength: "Maximum" } };
    case "staging": return {
      ...base, data: {
        roomUse: "Lobby / reception", program: "",
        occupancy: 30, livedIn: 45, styling: 40,
        stagingMode: "Rebuild photorealistically",
        furniturePolicy: "Keep silhouette, rebuild as real product",
        rebuild: Object.fromEntries(STAGING.map(([k]) => [k, true])),
        keepFootprints: true,
        viewContext: "",
      }
    };
    case "reference": return { ...base, data: { items: [] } };
    case "material": return { ...base, data: { items: [] } };
    case "lighting": return {
      ...base, data: {
        time: "15:00", brightness: 55, contrast: 45, warmth: 60, interior: 50, shadow: 65, sun: 55,
        direction: "Sunlight from the upper left, raking across the main façade",
        ambient: "Soft ambient fill from an open sky; shadows lifted and full of colour",
        weather: "Clear with light high cloud", sky: "Pale warm sky, thin cirrus, no heavy drama",
        artificial: "", daylightBalance: 70,
        artificialLevel: "asdrawn", cct: "3000K",
        fixtures: { cove: false, downlight: true, linear: true, pendant: true, wall: true, lamp: true, accent: true, underCabinet: false },
        directSun: true, sunPatch: 55, viewExposure: 70, blinds: "Open",
      }
    };
    case "context": return {
      ...base, data: {
        people: 35, cars: 25, landscape: 60, street: 30, interiorAct: 30, location: "",
        entourageMode: "Rebuild photorealistically",
        rebuild: Object.fromEntries(ENTOURAGE.map(([k]) => [k, true])),
        keepPositions: true,
      }
    };
    case "negative": return { ...base, data: { rules: DEFAULT_NEGATIVES.map((t) => ({ id: uid("r"), text: t, on: true })) } };
    case "revision": return { ...base, data: { mode: "Material only", note: "" } };
    default: return base;
  }
}

function starterProject(name = "Untitled project", scene = "Exterior") {
  const interior = scene === "Interior";
  const out = { id: uid("out"), type: "output", x: 700, y: 240, data: { series: true, approvedNote: "" } };
  const baseN = newNode("base", 60, 60);
  baseN.data.space = scene;
  const presetN = newNode("preset", 60, 250);
  presetN.data.presetId = interior ? "p-int" : "p-ext-day";
  const lightN = newNode("lighting", 370, 60);
  if (interior) {
    lightN.data = {
      ...lightN.data, time: "10:00", brightness: 60, contrast: 40, warmth: 60, interior: 70, shadow: 75, sun: 40,
      direction: "Daylight entering through the real window positions in the base image, from the left",
      ambient: "Soft bounced fill from walls and ceiling; shadows open and coloured by nearby surfaces",
      weather: "Bright overcast to soft sun", sky: "Seen only through the openings — pale, slightly overexposed",
      artificial: "Warm 3000K artificial light, secondary to daylight: indirect cove or linear ceiling light, low-level accent on joinery and art, task light only where a real fixture exists.",
      daylightBalance: 70,
    };
  }
  const negN = newNode("negative", 60, 540);
  if (interior) negN.data.rules = INTERIOR_NEGATIVES.map((t) => ({ id: uid("r"), text: t, on: true }));
  const nodes = [
    baseN, presetN,
    interior ? newNode("ilock", 60, 400) : newNode("lock", 60, 400),
    lightN,
    newNode("material", 370, 260),
    newNode("reference", 370, 400),
    interior ? newNode("staging", 370, 540) : newNode("context", 370, 540),
    negN,
    out,
  ];
  const edges = nodes.filter((n) => n.type !== "output").map((n) => ({ id: uid("e"), from: n.id, to: out.id }));
  return {
    id: uid("proj"), name, scene, createdAt: Date.now(), updatedAt: Date.now(),
    nodes, edges, viewport: { x: 40, y: 20, z: 0.82 },
  };
}

/* --------------------------- prompt composition -------------------------- */

const CORE_RULE =
`The uploaded base image is the architectural source of truth.

Preserve the exact architecture, camera angle, camera position, perspective, field of view, image framing, massing, roof geometry, floor levels, structural logic, openings, façade proportions and spatial relationships.

Do not redesign the architecture unless explicitly instructed.

Improve only material realism, lighting, reflections, glazing, landscape, entourage, atmosphere and photographic quality.`;

const CORE_RULE_INTERIOR =
`The uploaded base image is the spatial source of truth.

Preserve the exact room volume, camera angle, camera position, perspective, field of view, image framing, wall and partition positions, ceiling height and ceiling design, floor level, window and door positions, columns and beams, built-in joinery, fixed fixtures and the position of every light fitting.

Do not redesign the interior architecture unless explicitly instructed.

Improve only material realism, lighting, reflections, glazing, furnishing quality, styling, occupancy, the view through openings, atmosphere and photographic quality.`;

const PHOTOREALISM_INTERIOR =
`Render as an interior photograph, not as a visualisation. 16–24mm full-frame equivalent with verticals corrected and no fisheye stretching at the edges. White balance resolved for mixed daylight and artificial light — daylight zones read neutral-cool, artificial zones read warm, neither dominates. Exposure is bracketed the way an interior photographer would: window views bright but not blown, shadows under furniture open but not flat. Depth of field is real — near foreground edges softly out of focus.

Every surface responds honestly to light: matte walls show subtle roller texture, timber shows grain and end-grain at edges, stone shows sheen variation, fabric shows weave and slight pilling. Reflections in glass, polished stone and metal agree with the room geometry and show the real room, including the space behind the camera. Every object touches its surface with a contact shadow. Nothing may look composited; the room and everything in it share one lens, one grain and one moment.`;

const SERIES_RULE =
`This image is one view of a project that will be rendered as a series. Once a view from this project has been rendered and accepted in this conversation, that accepted render becomes the continuity reference for every later view: the same material palette and finishes, the same lighting condition and time of day, the same colour grade, sky and weather, the same planting species and entourage style, the same photographic treatment, lens character and grain. Every later view must read as a photograph taken on the same day, by the same photographer, of the same finished building.

Continuity applies to appearance only. Geometry, camera and framing are always taken from the new base image, never from an earlier render. Where a material or element appears in both views, it must match; where the new view shows something not seen before, resolve it in the same language as the accepted render.`;

const REF_RULE =
`Reference images are visual references only.

Extract only the requested qualities such as material, texture, lighting, color, atmosphere, furniture style or landscaping.

Never copy architectural geometry from a reference image unless explicitly instructed.`;

const PHOTOREALISM =
`Render as a photograph, not as a visualisation. Correct verticals, a full-frame architectural focal length, natural depth of field and honest material response to light. Surfaces carry grain, wear and slight unevenness. Highlights roll off; shadows retain colour rather than clipping to black. Entourage — people, vehicles, planting, sky — reads as documentary rather than decorative.

The building and everything around it must belong to a single photograph: one sun position, one colour temperature, one lens, one film response, one depth of field. Nothing may look composited. Every object touches the ground with a real contact shadow, recedes with correct atmospheric perspective and shares the same sensor grain as the rest of the frame.`;

function connectedNodes(project) {
  const out = project.nodes.find((n) => n.type === "output");
  if (!out) return [];
  const incoming = new Map();
  project.edges.forEach((e) => {
    if (!incoming.has(e.to)) incoming.set(e.to, []);
    incoming.get(e.to).push(e.from);
  });
  const seen = new Set([out.id]);
  const stack = [out.id];
  while (stack.length) {
    const cur = stack.pop();
    (incoming.get(cur) || []).forEach((id) => { if (!seen.has(id)) { seen.add(id); stack.push(id); } });
  }
  return project.nodes.filter((n) => seen.has(n.id) && n.type !== "output");
}

function buildPrompt(project, presets, mode = "master") {
  const live = connectedNodes(project);
  const of = (t) => live.filter((n) => n.type === t);
  const first = (t) => of(t)[0];

  const baseN = first("base");
  const presetN = first("preset");
  const lockN = first("lock");
  const ilockN = first("ilock");
  const lightN = first("lighting");
  const ctxN = first("context");
  const stageN = first("staging");
  const revN = first("revision");
  const outN = project.nodes.find((n) => n.type === "output");
  const series = outN?.data?.series !== false;
  const approvedNote = outN?.data?.approvedNote || "";
  const preset = presetN ? presets.find((p) => p.id === presetN.data.presetId) : null;

  const interior = project.scene ? project.scene === "Interior" : (baseN ? baseN.data.space === "Interior" : !!(ilockN || stageN));
  const refs = of("reference").flatMap((n) => n.data.items);
  const mats = of("material").flatMap((n) => n.data.items);
  const negs = of("negative").flatMap((n) => n.data.rules.filter((r) => r.on).map((r) => r.text));

  const head = [];
  const pName = baseN?.data.projectName || project.name;
  const vName = baseN?.data.viewName;
  head.push(`VESSU RENDER LAB — ${interior ? "INTERIOR " : ""}${mode === "revision" ? "REVISION PROMPT" : mode === "short" ? "SHORT PROMPT" : "MASTER PROMPT"}`);
  head.push(`Project: ${pName}${vName ? ` — View: ${vName}` : ""}${baseN ? ` — ${baseN.data.space}` : ""}`);

  /* -------- revision mode -------- */
  if (mode === "revision") {
    const m = revN?.data.mode || "Material only";
    const scope = {
      "Material only": "material appearance, finish, texture and reflectivity",
      "Lighting only": "lighting, exposure, shadow behaviour and colour temperature",
      "Landscape only": "planting, ground cover, paving and landscape elements",
      "Atmosphere only": "sky, weather, haze and overall atmosphere",
      "Furniture only": "the appearance of loose furniture, keeping every footprint, orientation and height",
      "Décor and styling only": "accessories, soft furnishings, artwork, plants and styling objects",
      "View through windows only": "the exterior view seen through the glazing",
      "Object replacement": "the single specified object",
      "Fix distortion": "the distorted element identified below",
      "Increase realism": "material response, light falloff and photographic texture",
    }[m];
    return [
      head.join("\n"),
      "",
      `REVISION SCOPE — ${m.toUpperCase()}`,
      `Modify only the specified item. Everything else must remain unchanged.`,
      "",
      `Use the previously generated image as the base. Adjust only ${scope}.`,
      revN?.data.note ? `\nSPECIFIC CHANGE\n${revN.data.note}` : "",
      "",
      "UNCHANGED",
      interior
        ? "Camera angle, camera position, perspective, field of view, framing, room volume, walls, ceiling, floor level, openings, joinery, fixture positions, furniture layout and every element not named above must be pixel-consistent with the previous image."
        : "Camera angle, camera position, perspective, field of view, framing, massing, roof geometry, floor levels, structure, openings, façade proportions and every element not named above must be pixel-consistent with the previous image.",
      "",
      "Do not re-interpret the design. Do not re-compose the photograph. Do not crop.",
    ].filter(Boolean).join("\n");
  }

  /* -------- next-view (continuation) mode -------- */
  if (mode === "nextview") {
    return [
      `VESSU RENDER LAB — NEXT VIEW, SAME PROJECT`,
      head[1],
      "",
      "CONTINUITY",
      `The render you produced earlier in this conversation${approvedNote ? ` (${approvedNote})` : ""} is accepted. Use it as the continuity reference for this new view.`,
      "",
      "Carry over from the accepted render, exactly: material palette and finishes; lighting condition and time of day; colour grade and white balance; sky and weather; planting species and entourage style; furniture and styling language; photographic treatment, lens character, depth of field and grain.",
      "",
      "Take from the new base image, exactly: all geometry, camera angle, camera position, perspective, field of view and framing. " + (interior
        ? "Preserve the room volume, walls, ceiling, floor level, openings, joinery, fixture positions and furniture layout of this new base image."
        : "Preserve the massing, roof, floor levels, structure, openings and façade proportions of this new base image."),
      "",
      `The result must read as a photograph taken on the same day, by the same photographer, of the same finished ${interior ? "interior" : "building"}. Any element seen in both views must match. Any element new to this view is resolved in the same language as the accepted render.`,
      "",
      "Do not re-interpret the design. Do not change the established materials or light. Do not crop.",
      negs.length ? `\nAVOID — ${negs.join("; ")}.` : "",
    ].filter((x) => x !== "").join("\n");
  }

  /* -------- short mode -------- */
  if (mode === "short") {
    const bits = [];
    bits.push(head.join("\n"));
    bits.push("");
    bits.push(interior
      ? "Re-render the uploaded base image as a photorealistic interior photograph. The base image is the spatial source of truth: preserve camera, perspective, framing, room volume, walls, ceiling design, floor level, openings, columns, built-in joinery, fixed fixtures, light fixture positions and furniture layout exactly. Improve only materials, lighting, reflections, furnishing quality, styling, occupancy, the view through windows and photographic quality."
      : "Re-render the uploaded base image as a photorealistic architectural photograph. The base image is the source of truth: preserve architecture, camera, perspective, framing, massing, roof, floors, structure, openings and façade proportions exactly. Improve only materials, lighting, reflections, glazing, landscape, entourage and photographic quality.");
    if (preset) bits.push(`\nSTYLE — ${preset.name}\n${preset.visual}`);
    if (lightN) {
      const d = lightN.data;
      if (interior) {
        const lvl = ARTIFICIAL_LEVELS.find(([k]) => k === (d.artificialLevel || "asdrawn")) || ARTIFICIAL_LEVELS[1];
        const banned = FIXTURE_TYPES.filter(([k]) => !(d.fixtures || {})[k]).map(([, , ph]) => ph);
        bits.push(`\nLIGHT — ${d.time}. ${d.direction}. Artificial light: ${lvl[1].toLowerCase()}${lvl[0] !== "off" ? `, ${d.cct || "3000K"}` : ""}. Every light source must come from a fitting visible in the image; no cove, slot, LED-strip or glowing edge that is not modelled.${banned.length ? ` Prohibited unless modelled: ${banned.join("; ")}.` : ""}`);
      } else {
        bits.push(`\nLIGHT — ${d.time}. ${d.direction}. ${d.weather}.`);
      }
    }
    if (mats.length) bits.push(`\nMATERIALS — ${mats.map((m) => `${m.element || "element"}: ${m.target || "as specified"}`).join("; ")}.`);
    {
      const lg = of("legend").flatMap((n) => n.data.items);
      const lgN = first("legend");
      if (baseN?.data.source === "SketchUp screenshot" || lgN) {
        bits.push(`\nREADING THE CAPTURE — every colour and texture in the base image is a placeholder code, not a finished material. Ignore edge lines, hard shadows, texture scale and background colour.${lg.length ? ` Legend: ${lg.map((it) => `${it.hex ? it.hex.toUpperCase() + " " : ""}${it.appearsAs || (it.hex ? hexToName(it.hex) : "")}${it.element ? ` on ${it.element}` : ""} = ${it.material || "?"}`).join("; ")}.` : ""} Anything unlisted → ${lgN?.data.fallback || "matte off-white plaster"}.`);
      }
    }
    if (refs.length) bits.push(`\nREFERENCES — ${refs.length} image${refs.length > 1 ? "s" : ""}, used for ${[...new Set(refs.map((r) => r.category.toLowerCase()))].join(", ")} only. Never copy geometry from a reference.`);
    if (interior && stageN) {
      const d = stageN.data;
      const sm = d.stagingMode || "Rebuild photorealistically";
      bits.push(`\nSTAGING — ${d.roomUse}${d.program ? `, ${d.program}` : ""}. Occupancy ${word(d.occupancy, S_AMT)}, ${word(d.livedIn, ["empty", "lightly staged", "staged", "lived-in", "well lived-in"])}. ${sm === "Keep as drawn"
        ? "Keep all furniture and styling as drawn."
        : sm === "Enhance in place"
          ? "Raise the existing furniture, textiles, décor, plants, light fittings and window view to photographic quality in place."
          : "Every furniture piece, textile, object, plant, fitting and window view in the base image is a placeholder — rebuild each as a real one in the same position and footprint. Match light, contact shadows and reflections so nothing looks pasted in. The room shell stays locked."}`);
    }
    if (!interior && ctxN) {
      const mode2 = ctxN.data.entourageMode || "Rebuild photorealistically";
      bits.push(`\nCONTEXT — ${ctxN.data.location ? `${ctxN.data.location}. ` : ""}${mode2 === "Keep as drawn"
        ? "Keep all entourage as drawn."
        : mode2 === "Enhance in place"
          ? "Raise the existing trees, people, vehicles, sky and ground to photographic quality in place."
          : "Every non-architectural element in the base image is a placeholder — replace the proxy trees, people, vehicles, sky, ground surface and distant context with photographically real ones, in the same positions and at the same scale. Match sun direction, colour temperature, contact shadows and depth of field so nothing looks pasted in. The building itself stays locked."}`);
    }
    if (series) bits.push(`\nSERIES — if a view of this project has already been rendered and accepted here, match its materials, lighting, colour grade, entourage and photographic treatment exactly; take only geometry and camera from this new base image.`);
    if (negs.length) bits.push(`\nAVOID — ${negs.join("; ")}.`);
    return bits.join("\n");
  }

  /* -------- master mode -------- */
  const L = [];
  L.push(head.join("\n"));
  L.push("");

  L.push("1. TASK");
  L.push(interior
    ? `Re-render the uploaded base image as a photorealistic interior photograph of the same room, from the same camera, with the same layout. This is a rendering and styling task, not a design task.`
    : `Re-render the uploaded base image as a photorealistic architectural photograph of the same building, from the same camera, at the same moment of construction completeness. This is a rendering task, not a design task.`);
  if (baseN) L.push(`Base image source: ${baseN.data.source}. Scene type: ${baseN.data.space.toLowerCase()}.`);
  L.push("");

  L.push("2. BASE IMAGE RULE");
  L.push(interior ? CORE_RULE_INTERIOR : CORE_RULE);
  L.push("");

  /* ---- section 3: the lock ---- */
  const activeLock = interior ? (ilockN || lockN) : (lockN || ilockN);
  const lockFlags = activeLock?.type === "ilock" ? ILOCK_FLAGS : LOCK_FLAGS;
  L.push(`3. ${activeLock?.type === "ilock" ? "INTERIOR LOCK" : "ARCHITECTURE LOCK"}${activeLock ? ` — STRENGTH: ${activeLock.data.strength.toUpperCase()}` : ""}`);
  if (activeLock) {
    lockFlags.filter(([k]) => activeLock.data.flags[k])
      .forEach(([k, label]) => L.push(k === "noCrop" || k === "noRedesign" ? `- ${label}` : `- Preserve ${label.charAt(0).toLowerCase()}${label.slice(1)}`));
    L.push("");
    L.push(STRENGTH_NOTE[activeLock.data.strength]);
    if (activeLock.type === "ilock") {
      const sm = stageN?.data.stagingMode || "Rebuild photorealistically";
      if (activeLock.data.flags.furnitureLayout && sm !== "Keep as drawn") {
        L.push("");
        L.push("Note on furniture: this lock covers layout only — where each piece sits, its footprint, orientation and overall height. The appearance of each piece is rebuilt under section 8.");
      }
      if (activeLock.data.flags.lightLayout) {
        L.push("");
        L.push("Note on light fittings: positions are locked; the fittings themselves are rendered as real luminaires under section 8 and lit according to section 6.");
      }
    } else if (activeLock.data.flags.landscape && ctxN && (ctxN.data.entourageMode || "Rebuild photorealistically") !== "Keep as drawn") {
      L.push("");
      L.push("Note on landscape: this lock covers the designed layout only — planter positions, level changes, paving layout and the location and spread of each tree. The appearance of planting, ground surface and entourage is rebuilt photographically under section 8.");
    }
  } else {
    L.push(interior
      ? "- Preserve the room shell, openings, joinery, fixture positions, furniture layout, camera and framing exactly as in the base image."
      : "- Preserve all architecture, camera and framing exactly as in the base image.");
  }
  L.push("");

  L.push(`4. STYLE${preset ? ` — ${preset.name}` : ""}`);
  if (preset) {
    L.push(`Visual style: ${preset.visual}`);
    L.push(`Material behaviour: ${preset.material}`);
    L.push(`Lighting behaviour: ${preset.lighting}`);
    L.push(`Photography: ${preset.photography}`);
    L.push(`Landscaping: ${preset.landscaping}`);
    L.push(`Realism rules: ${preset.realism}`);
  } else {
    L.push("No style preset connected. Render in a calm, warm-neutral architectural photography style with soft light and honest materials.");
  }
  L.push("");

  L.push("5. MATERIALS");
  const legendItems = of("legend").flatMap((n) => n.data.items);
  const legendN = first("legend");
  const isSketchUp = baseN?.data.source === "SketchUp screenshot";
  const isClay = baseN?.data.source === "Clay render";
  if (isSketchUp || isClay || legendN) {
    L.push("");
    L.push("5.1 HOW TO READ THE BASE IMAGE");
    if (isSketchUp) {
      const cs = baseN.data.captureStyle || "Shaded with textures";
      L.push(`Capture style: ${cs}.`);
      L.push(CAPTURE_READING[cs]);
    } else if (isClay) {
      L.push("The base image is a clay render. Surface tone carries no material information; read materials from the legend by element and location, and from the material instructions. Where nothing is specified, default to the fallback material.");
    } else {
      L.push("Surface colours and textures in the base image are placeholders. Read materials from the legend below.");
    }
    if (legendN?.data.guards !== false && (isSketchUp || legendN)) {
      L.push("");
      CAPTURE_GUARDS.forEach((g) => L.push(`- ${g}`));
    }
  }

  if (legendN) {
    L.push("");
    L.push("5.2 MATERIAL LEGEND");
    if (legendItems.length) {
      L.push("Each entry maps what is visible in the base image to the real material it stands for. Apply the mapping to every face showing that colour or texture, wherever it occurs, unless a location is given.");
      legendItems.forEach((it, i) => {
        const key = it.hex ? `${it.hex.toUpperCase()} (${it.appearsAs || hexToName(it.hex)})` : (it.appearsAs || "unspecified appearance");
        const where = it.element ? ` on ${it.element}` : "";
        const spec = [it.finish && `finish: ${it.finish}`, it.size && `module or size: ${it.size}`].filter(Boolean).join(", ");
        L.push(`${i + 1}. ${key}${where} → ${it.material || "material not set"}${spec ? ` (${spec})` : ""}`);
        if (it.note) L.push(`   ${it.note}`);
      });
    } else {
      L.push("No legend entries yet.");
    }
    L.push(`Fallback for any surface not covered: ${legendN.data.fallback || "matte off-white plaster"}.`);
  }

  if (legendN || isSketchUp || isClay) { L.push(""); L.push("5.3 MATERIAL CHANGES"); }
  if (mats.length) {
    mats.forEach((m, i) => {
      const spec = [
        m.current && `currently ${m.current}`, m.finish && `finish: ${m.finish}`,
        m.scale && `texture scale: ${m.scale}`, m.rough && `roughness: ${m.rough}`,
        m.reflect && `reflectivity: ${m.reflect}`,
        (() => {
          const idx = m.refId ? refs.findIndex((r) => r.id === m.refId) : -1;
          if (idx >= 0) return `take this material from reference [${idx + 1}] — ${refs[idx].title || refs[idx].category}`;
          return m.ref ? `see reference: ${m.ref}` : "";
        })(),
      ].filter(Boolean).join(", ");
      L.push(`${i + 1}. ${m.element || "Element"} → ${m.target || "target material"}${spec ? ` (${spec})` : ""}`);
      if (m.instruction) L.push(`   ${m.instruction}`);
    });
    L.push("");
    L.push("Apply each material change only to the element named. Do not extend a material onto adjacent surfaces, and do not change the geometry of any element in order to suit a material.");
  } else {
    L.push("Keep all existing materials. Improve only their realism — texture, grain, wear, light response and reflection accuracy.");
  }
  L.push("");

  L.push("6. LIGHTING");
  if (lightN) {
    const d = lightN.data;
    L.push(`Time of day: ${d.time}.`);
    L.push(`Brightness ${word(d.brightness, S_LOW)}, contrast ${word(d.contrast, S_LOW)}, warmth ${word(d.warmth, S_LOW)}, sun intensity ${word(d.sun, S_LOW)}, shadow softness ${word(d.shadow, S_LOW)}, ${interior ? "view visibility through glazing" : "interior visibility through glazing"} ${word(d.interior, S_LOW)}.`);
    if (d.direction) L.push(`Light direction: ${d.direction}`);
    if (d.ambient) L.push(`Ambient: ${d.ambient}`);
    if (interior) {
      const b = d.daylightBalance ?? 70;
      L.push("");
      L.push("DAYLIGHT");
      L.push(`Daylight enters only through the openings visible in the base image${d.blinds && d.blinds !== "Open" ? `, with blinds or curtains ${d.blinds.toLowerCase()}` : ""}. It falls off with distance into the room and bounces from the real floor and wall surfaces.`);
      L.push(d.directSun !== false
        ? `Direct sun patches on floor and walls: yes — ${word(d.sunPatch ?? 55, ["hard-edged", "fairly crisp", "moderately soft", "soft", "very soft, almost diffuse"])}, and only where the window geometry and sun direction would actually place them.`
        : "Direct sun patches: none — overcast or shaded daylight only, no hard sun shapes on any surface.");
      L.push(`Exterior view through glazing exposed ${word(d.viewExposure ?? 70, ["dark", "slightly darker than the room", "balanced with the room", "brighter than the room, detail retained", "very bright, near white"])}.`);
      L.push(`Daylight to artificial balance: ${b >= 80 ? "daylight-led, artificial light barely visible" : b >= 55 ? "daylight-led with artificial light as a secondary layer" : b >= 35 ? "balanced — daylight and artificial light equally present" : b >= 15 ? "artificial-led with daylight as a soft fill" : "artificial-led, daylight minimal"}.`);
      L.push("");
      L.push("ARTIFICIAL LIGHT");
      const lvl = ARTIFICIAL_LEVELS.find(([k]) => k === (d.artificialLevel || "asdrawn")) || ARTIFICIAL_LEVELS[1];
      L.push(`Level: ${lvl[1]}. ${lvl[2]}`);
      if (lvl[0] !== "off") {
        L.push(`Colour temperature of all artificial light: ${d.cct || "3000K"}.`);
        const fx = d.fixtures || {};
        const allowed = FIXTURE_TYPES.filter(([k]) => fx[k]).map(([, , phrase]) => phrase);
        const banned = FIXTURE_TYPES.filter(([k]) => !fx[k]).map(([, , phrase]) => phrase);
        if (lvl[0] === "restrained" || lvl[0] === "full") {
          L.push(`Permitted fixture types: ${allowed.length ? allowed.join("; ") : "none — do not add any fixtures"}.`);
        }
        if (banned.length) L.push(`Prohibited unless physically modelled in the base image: ${banned.join("; ")}.`);
        if (d.artificial) L.push(`Lighting notes: ${d.artificial}`);
      }
      L.push("");
      L.push("Rules for every artificial light source: it must originate from a fitting that is visible in the image, at the position where the fitting is. Do not add ceiling coves, slot lights, light troughs, LED strips, backlit panels, glowing ceiling edges, glowing wall edges or glowing joinery gaps that are not modelled in the base image. A flat ceiling in the base image stays flat and unlit. A plain wall stays plain. No surface emits light on its own.");
    } else {
      if (d.weather) L.push(`Weather: ${d.weather}`);
      if (d.sky) L.push(`Sky: ${d.sky}`);
      L.push(`All shadows must be cast by this single lighting condition and must agree with the geometry of the base image.`);
    }
  } else L.push(interior ? "Use soft daylight from the real openings, with warm secondary artificial light." : "Use soft, even daylight consistent with the base image.");
  L.push("");

  L.push("7. REFERENCES");
  L.push(REF_RULE);
  if (refs.length) {
    L.push("");
    L.push(`${refs.length} reference image${refs.length > 1 ? "s are" : " is"} supplied, in this order:`);
    refs.forEach((r, i) => {
      L.push(`[${i + 1}] ${r.category} — ${r.title || "untitled"}`);
      if (r.instruction) L.push(`    ${r.instruction}`);
    });
  } else {
    L.push("");
    L.push("No reference images are supplied for this render.");
  }
  L.push("");

  /* ---- section 8 ---- */
  if (interior) {
    L.push("8. INTERIOR STAGING & OCCUPANCY");
    if (stageN) {
      const d = stageN.data;
      const sm = d.stagingMode || "Rebuild photorealistically";
      const rb = d.rebuild || Object.fromEntries(STAGING.map(([k]) => [k, true]));
      L.push(`Room use: ${d.roomUse}${d.program ? ` — ${d.program}` : ""}.`);
      L.push(`Occupancy: ${word(d.occupancy, S_AMT)}. Lived-in level: ${word(d.livedIn, ["empty and unoccupied", "lightly staged", "staged", "lived-in with traces of daily use", "well lived-in"])}. Styling density: ${word(d.styling, ["minimal", "sparse", "moderate", "rich", "dense"])}.`);
      if (d.viewContext) L.push(`View through openings: ${d.viewContext}.`);
      L.push("");

      if (sm === "Keep as drawn") {
        L.push("FURNITURE, STYLING AND OCCUPANCY — KEEP AS DRAWN");
        L.push("Keep all furniture, objects, textiles, plants and fittings exactly as they appear in the base image. Improve only their material and light response.");
      } else {
        const rebuilding = sm === "Rebuild photorealistically";
        L.push(`FURNITURE, STYLING AND OCCUPANCY — ${rebuilding ? "REBUILD PHOTOREALISTICALLY" : "ENHANCE IN PLACE"}`);
        L.push(rebuilding
          ? "The base image is a working model, so every non-architectural element in it is a placeholder — blocky or generic furniture, flat textiles, symbolic objects, untextured surfaces, blank glazing, diagrammatic light fittings. Detect each one and replace it with a photographically real equivalent. Visible difference from the base image is expected and correct for these elements only."
          : "Keep the existing furniture, objects and fittings, but raise each one to photographic quality — real texture, correct light response, accurate contact shadows and reflections.");
        const fp = d.furniturePolicy || FURNITURE_POLICIES[0];
        L.push("");
        L.push(`Furniture policy: ${fp === FURNITURE_POLICIES[0]
          ? "keep the type, silhouette, footprint, orientation and seat or work height of every piece; rebuild only its material, construction detail and product quality."
          : fp === FURNITURE_POLICIES[1]
            ? "each piece may be restyled to a different real product of the same type, as long as it occupies the same footprint, orientation and approximate height."
            : "keep every piece exactly as drawn."}`);
        const active = STAGING.filter(([k]) => rb[k] !== false);
        if (active.length) {
          L.push("");
          active.forEach(([, label, instr]) => L.push(`- ${label}: ${instr}`));
        }
        if (d.keepFootprints !== false) {
          L.push("");
          L.push("Keep every replacement in the same position, footprint and height envelope as the placeholder it replaces. Rebuild the appearance, not the layout. Do not add furniture where there is none, and do not remove furniture that is drawn.");
        }
        L.push("");
        L.push("Nothing may read as pasted in. Every added or rebuilt object shares the room's light direction, colour temperature and depth of field, casts a contact shadow on the surface it rests on, and appears correctly in any glass, mirror or polished surface that would reflect it.");
      }

      L.push("");
      L.push("BOUNDARY BETWEEN LOCKED AND REBUILT");
      L.push("Locked to the base image — room volume, wall and partition positions, ceiling height and design, floor level and steps, window and door positions and sizes, columns and beams, built-in joinery and fixed millwork, sanitaryware and fixed equipment, light fixture positions, floor and ceiling pattern layout, furniture layout and footprints.");
      L.push("Rebuilt to photographic quality — furniture appearance, soft furnishings, décor, artwork, plants, people, light fittings, the view through windows, surface materials and reflections.");
      L.push("Do not add walls, openings, joinery or furniture that are not in the base image. If an element is ambiguous, treat it as fixed architecture and preserve it.");
    } else L.push("Keep the furniture, styling and occupancy exactly as they appear in the base image.");
  } else {
    L.push("8. CONTEXT & ENTOURAGE");
    if (ctxN) {
      const d = ctxN.data;
      const mode2 = d.entourageMode || "Rebuild photorealistically";
      const rb = d.rebuild || Object.fromEntries(ENTOURAGE.map(([k]) => [k, true]));
      if (d.location) L.push(`Setting: ${d.location}.`);
      L.push(`People: ${word(d.people, S_AMT)}. Vehicles: ${word(d.cars, S_AMT)}. Street activity: ${word(d.street, S_AMT)}. Interior activity: ${word(d.interiorAct, S_AMT)}. Landscape enhancement: ${word(d.landscape, S_LOW)}.`);
      L.push("");

      if (mode2 === "Keep as drawn") {
        L.push("NON-ARCHITECTURAL ELEMENTS — KEEP AS DRAWN");
        L.push("Keep all non-architectural elements exactly as they appear in the base image. Improve only their material and light response.");
      } else {
        const rebuilding = mode2 === "Rebuild photorealistically";
        L.push(`NON-ARCHITECTURAL ELEMENTS — ${rebuilding ? "REBUILD PHOTOREALISTICALLY" : "ENHANCE IN PLACE"}`);
        L.push(rebuilding
          ? "The base image is a working model, so every non-architectural element in it is a placeholder — flat cut-out or low-polygon trees, symbolic people and cars, untextured ground, blank sky, diagrammatic context. Detect each one and replace it with a photographically real equivalent. Visible difference from the base image is expected and correct for these elements only."
          : "Keep the existing non-architectural elements, but raise each one to photographic quality — real texture, correct light response, accurate contact shadows and depth.");
        const active = ENTOURAGE.filter(([k]) => rb[k] !== false);
        if (active.length) {
          L.push("");
          active.forEach(([, label, instr]) => L.push(`- ${label}: ${instr}`));
        }
        if (d.keepPositions !== false) {
          L.push("");
          L.push("Keep every replacement in the same position, footprint and height envelope as the placeholder it replaces — a tree stays where the tree is, at the same canopy spread and height; a figure stays where the figure is. Rebuild the appearance, not the layout.");
        }
        L.push("");
        L.push("Nothing may read as pasted in. Matching sun direction, colour temperature, contact shadow, perspective scale, depth of field and grain are required for every added element. No repeated identical figures, no cut-out foliage, no stock-photo lighting, no entourage floating above the ground plane.");
      }

      L.push("");
      L.push("BOUNDARY BETWEEN LOCKED AND REBUILT");
      L.push("Locked to the base image — massing, roof geometry, floor levels, structure, columns, façade proportions, openings, balconies, canopies, railings, louvres, and all designed hardscape geometry including planter edges, podium edges, steps, level changes and paving layout.");
      L.push("Rebuilt to photographic quality — planting, people, vehicles, sky, water, ground surface texture and surrounding context.");
      L.push("Do not add buildings, roads or level changes that are not in the base image. If an element is ambiguous, treat it as architecture and preserve it.");
    } else L.push("Keep the surrounding context exactly as it appears in the base image.");
  }
  L.push("");

  L.push("9. PHOTOREALISM");
  L.push(interior ? PHOTOREALISM_INTERIOR : PHOTOREALISM);
  L.push("");

  L.push("10. NEGATIVE RULES");
  if (negs.length) negs.forEach((n) => L.push(`- ${n}`));
  else L.push(interior ? "- Do not move walls or openings. Do not change the camera. Do not crop." : "- Do not redesign the building. Do not change the camera. Do not crop.");

  if (series) {
    L.push("");
    L.push("11. SERIES CONSISTENCY");
    L.push(SERIES_RULE);
    if (approvedNote) L.push(`Accepted reference so far: ${approvedNote}.`);
  }

  return L.join("\n");
}

/* ------------------------------ small parts ------------------------------ */

function Field({ label, children }) {
  return <div style={{ marginBottom: 10 }}><span className="vrl-lbl">{label}</span>{children}</div>;
}

function Toggle({ on, onChange, label }) {
  return (
    <button className="vrl-row" onClick={() => onChange(!on)} style={{ width: "100%", padding: "4px 0", textAlign: "left" }}>
      <span className={`vrl-sw${on ? " on" : ""}`}><i /></span>
      <span style={{ fontSize: 12, color: on ? "var(--fg)" : "var(--fg-3)" }}>{label}</span>
    </button>
  );
}

function Slider({ label, value, onChange, scale = S_LOW }) {
  return (
    <div style={{ marginBottom: 9 }}>
      <div className="vrl-row" style={{ justifyContent: "space-between", marginBottom: 2 }}>
        <span className="vrl-lbl" style={{ margin: 0 }}>{label}</span>
        <span style={{ fontSize: 10.5, color: "var(--fg-2)" }}>{word(value, scale)}</span>
      </div>
      <input className="vrl-range" type="range" min="0" max="100" value={value}
        onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

function Eyedropper({ src, onPick }) {
  const imgRef = useRef(null);
  const cvsRef = useRef(null);
  const [hover, setHover] = useState(null);
  const sample = (e) => {
    const img = imgRef.current;
    if (!img || !img.naturalWidth) return null;
    const r = img.getBoundingClientRect();
    const x = Math.floor(((e.clientX - r.left) / r.width) * img.naturalWidth);
    const y = Math.floor(((e.clientY - r.top) / r.height) * img.naturalHeight);
    if (!cvsRef.current) {
      const c = document.createElement("canvas");
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      c.getContext("2d").drawImage(img, 0, 0);
      cvsRef.current = c;
    }
    const ctx = cvsRef.current.getContext("2d");
    const R = 2;
    const data = ctx.getImageData(clamp(x - R, 0, img.naturalWidth - 1), clamp(y - R, 0, img.naturalHeight - 1),
      Math.min(2 * R + 1, img.naturalWidth), Math.min(2 * R + 1, img.naturalHeight)).data;
    let rr = 0, gg = 0, bb = 0, n = 0;
    for (let i = 0; i < data.length; i += 4) { rr += data[i]; gg += data[i + 1]; bb += data[i + 2]; n++; }
    const hex = "#" + [rr, gg, bb].map((v) => Math.round(v / n).toString(16).padStart(2, "0")).join("");
    return hex;
  };
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ position: "relative", cursor: "crosshair", lineHeight: 0 }}>
        <img ref={imgRef} src={src} alt="" crossOrigin="anonymous"
          style={{ width: "100%", borderRadius: 2, border: "1px solid var(--line)" }}
          onLoad={() => { cvsRef.current = null; }}
          onMouseMove={(e) => setHover(sample(e))}
          onMouseLeave={() => setHover(null)}
          onClick={(e) => { const h = sample(e); if (h) onPick(h); }} />
        {hover && (
          <div className="vrl-row" style={{
            position: "absolute", right: 6, bottom: 6, gap: 6, background: "rgba(16,15,13,.9)",
            border: "1px solid var(--line)", borderRadius: 2, padding: "3px 7px", fontSize: 10.5, lineHeight: 1.4
          }}>
            <span style={{ width: 12, height: 12, background: hover, borderRadius: 2, border: "1px solid var(--line)" }} />
            {hover.toUpperCase()} · {hexToName(hover)}
          </div>
        )}
      </div>
      <div style={{ fontSize: 10.5, color: "var(--fg-3)", marginTop: 5 }}>{t("Click a surface in the base image to add its colour to the legend.")}</div>
    </div>
  );
}

function CopyImageButton({ src, label }) {
  const [state, setState] = useState("idle");
  return (
    <button className={`vrl-btn${state === "done" ? " pri" : ""}`} style={{ height: 24, padding: "0 8px", fontSize: 10.5 }}
      onClick={async () => {
        const ok = await copyImage(src);
        setState(ok ? "done" : "fail"); setTimeout(() => setState("idle"), 2200);
      }}>
      {state === "done" ? <Check size={12} strokeWidth={1.5} /> : <Copy size={12} strokeWidth={1.4} />}
      {state === "done" ? t("Copied — paste in ChatGPT") : state === "fail" ? t("Clipboard blocked — drag the file instead") : label}
    </button>
  );
}

function Modal({ title, onClose, children, footer, wide }) {
  return (
    <div className="vrl-modal-bg" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="vrl-modal" style={wide ? { maxWidth: 980 } : undefined}>
        <div className="vrl-row" style={{ padding: "13px 18px", borderBottom: "1px solid var(--line-soft)" }}>
          <span style={{ flex: 1, fontSize: 12, letterSpacing: ".06em" }}>{title}</span>
          <button className="vrl-btn ghost" onClick={onClose}><X size={14} strokeWidth={1.4} /></button>
        </div>
        <div className="vrl-scroll" style={{ padding: 18 }}>{children}</div>
        {footer && <div className="vrl-row" style={{ padding: "12px 18px", borderTop: "1px solid var(--line-soft)", justifyContent: "flex-end", gap: 8 }}>{footer}</div>}
      </div>
    </div>
  );
}

function CopyButton({ text, label = "Copy", primary }) {
  const [done, setDone] = useState(false);
  return (
    <button className={`vrl-btn${primary ? " pri" : ""}`} onClick={async () => {
      const ok = await copyText(text);
      setDone(ok); setTimeout(() => setDone(false), 1600);
    }}>
      {done ? <Check size={13} strokeWidth={1.5} /> : <Copy size={13} strokeWidth={1.4} />}
      {done ? "Copied" : label}
    </button>
  );
}

/* -------------------------------- the app -------------------------------- */

export default function VessuRenderLab() {
  const [ready, setReady] = useState(false);
  const [index, setIndex] = useState([]);           // [{id,name,updatedAt}]
  const [project, setProject] = useState(null);
  const [presets, setPresets] = useState(BUILTIN_PRESETS);
  const [refLib, setRefLib] = useState([]);
  const [libFolder, setLibFolder] = useState(null);      // null = folder list
  const [libNewFolder, setLibNewFolder] = useState("");
  const [images, setImages] = useState({});          // imageId -> dataURL
  const [selId, setSelId] = useState(null);
  const [tab, setTab] = useState("nodes");           // nodes | projects | presets | library
  const [modal, setModal] = useState(null);          // prompt | chatgpt | preset-edit
  const [promptTab, setPromptTab] = useState("master");
  const [toast, setToast] = useState("");
  const [dirty, setDirty] = useState(false);
  const [editingPreset, setEditingPreset] = useState(null);

  const canvasRef = useRef(null);
  const dragRef = useRef(null);
  const [linking, setLinking] = useState(null);      // {from, x, y}
  const [dropId, setDropId] = useState(null);
  const [lang, setLang] = useState("en");
  LANG = lang;
  const fileRef = useRef(null);
  const importRef = useRef(null);
  const pendingUpload = useRef(null);
  const libPendingItems = useRef([]);
  const multiRef = useRef(null);

  const uploadManyToLibrary = async (fileList, folder) => {
    const files = [...(fileList || [])].filter((f) => f.type.startsWith("image/"));
    if (!files.length) return;
    libPendingItems.current = [];
    for (const f of files) { pendingUpload.current = { kind: "lib", folder }; await handleUpload(f); }
    const added = libPendingItems.current; libPendingItems.current = [];
    if (added.length) { await saveRefLib([...refLibRef.current, ...added]); say(`${added.length} ${t("added to")} ${folder}`); }
  };

  const say = useCallback((m) => { setToast(m); setTimeout(() => setToast(""), 2200); }, []);

  /* ---- boot ---- */
  useEffect(() => {
    (async () => {
      const idx = (await store.get(K.index)) || [];
      const custom = (await store.get(K.presets)) || [];
      const lib = (await store.get(K.reflib)) || [];
      const settings = (await store.get("vrl:settings")) || {};
      if (settings.lang) setLang(settings.lang);
      setPresets([...BUILTIN_PRESETS, ...custom]);
      setRefLib(lib);
      setIndex(idx);
      if (idx.length) await openProject(idx[0].id, [...BUILTIN_PRESETS, ...custom]);
      else setProject(starterProject("Vessu render — new project"));
      setReady(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadImages = useCallback(async (proj) => {
    const ids = new Set();
    proj.nodes.forEach((n) => {
      if (n.type === "base" && n.data.imageId) ids.add(n.data.imageId);
      if (n.type === "reference") n.data.items.forEach((i) => i.imageId && ids.add(i.imageId));
    });
    const entries = await Promise.all([...ids].map(async (id) => [id, await store.get(K.img(id))]));
    setImages((prev) => {
      const next = { ...prev };
      entries.forEach(([id, d]) => { if (d) next[id] = d; });
      return next;
    });
  }, []);

  async function openProject(id, presetList) {
    const p = await store.get(K.proj(id));
    if (!p) { say("That project could not be loaded"); return; }
    setProject(p); setSelId(null); setDirty(false);
    loadImages(p);
    if (presetList) setPresets(presetList);
  }

  /* ---- persistence ---- */
  const saveProject = useCallback(async (p = project, quiet = false) => {
    if (!p) return;
    const rec = { ...p, updatedAt: Date.now() };
    await store.set(K.proj(rec.id), rec);
    const nextIdx = [{ id: rec.id, name: rec.name, updatedAt: rec.updatedAt },
    ...index.filter((r) => r.id !== rec.id)];
    setIndex(nextIdx);
    await store.set(K.index, nextIdx);
    setProject(rec); setDirty(false);
    if (!quiet) say(t("Project saved"));
  }, [project, index, say]);

  const savePresets = useCallback(async (list) => {
    setPresets(list);
    await store.set(K.presets, list.filter((p) => !p.builtin));
  }, []);

  const refLibRef = useRef([]);
  useEffect(() => { refLibRef.current = refLib; }, [refLib]);
  const saveRefLib = useCallback(async (list) => {
    setRefLib(list);
    await store.set(K.reflib, list);
  }, []);

  /* ---- project mutation ---- */
  const mutate = useCallback((fn) => {
    setProject((p) => { if (!p) return p; const next = fn(structuredClone(p)); return next || p; });
    setDirty(true);
  }, []);

  const patchNode = useCallback((id, patch) => {
    mutate((p) => {
      const n = p.nodes.find((x) => x.id === id);
      if (n) n.data = { ...n.data, ...patch };
      return p;
    });
  }, [mutate]);

  const setScene = (scene) => {
    if ((project.scene || "Exterior") === scene) return;
    const interior = scene === "Interior";
    mutate((p) => {
      p.scene = scene;
      p.nodes.forEach((n) => {
        if (n.type === "base") n.data.space = scene;
        if (n.type === "preset" && (n.data.presetId === "p-ext-day" || n.data.presetId === "p-int")) n.data.presetId = interior ? "p-int" : "p-ext-day";
        if (n.type === "lock" && interior) { n.type = "ilock"; n.data = { ...newNode("ilock", 0, 0).data, strength: n.data.strength }; }
        else if (n.type === "ilock" && !interior) { n.type = "lock"; n.data = { ...newNode("lock", 0, 0).data, strength: n.data.strength }; }
        if (n.type === "context" && interior) { n.type = "staging"; n.data = newNode("staging", 0, 0).data; }
        else if (n.type === "staging" && !interior) { n.type = "context"; n.data = newNode("context", 0, 0).data; }
        if (n.type === "negative") {
          const known = new Set([...DEFAULT_NEGATIVES, ...INTERIOR_NEGATIVES]);
          if (n.data.rules.every((r) => known.has(r.text))) {
            n.data.rules = (interior ? INTERIOR_NEGATIVES : DEFAULT_NEGATIVES).map((tx) => ({ id: uid("r"), text: tx, on: true }));
          }
        }
        if (n.type === "lighting" && interior && !n.data.artificialLevel) {
          n.data = { ...newNode("lighting", 0, 0).data, ...n.data, artificialLevel: "asdrawn" };
        }
      });
      const out = p.nodes.find((q) => q.type === "output");
      const ensure = (type, x, y) => {
        if (!p.nodes.some((q) => q.type === type)) {
          const nn = newNode(type, x, y); p.nodes.push(nn);
          if (out) p.edges.push({ id: uid("e"), from: nn.id, to: out.id });
        }
      };
      ensure(interior ? "ilock" : "lock", 60, 400);
      ensure(interior ? "staging" : "context", 370, 540);
      return p;
    });
    setSelId(null);
    say(interior ? t("Switched to interior — lock, staging and lighting updated") : t("Switched to exterior — lock, context and lighting updated"));
  };

  const addNode = (type) => {
    const vp = project.viewport;
    const x = Math.round((-vp.x + 320) / vp.z + Math.random() * 60);
    const y = Math.round((-vp.y + 160) / vp.z + Math.random() * 60);
    const n = newNode(type, x, y);
    mutate((p) => {
      p.nodes.push(n);
      const out = p.nodes.find((q) => q.type === "output");
      if (out) p.edges.push({ id: uid("e"), from: n.id, to: out.id });
      return p;
    });
    setSelId(n.id); setTab("nodes");
  };

  const deleteNode = (id) => {
    mutate((p) => {
      p.nodes = p.nodes.filter((n) => n.id !== id);
      p.edges = p.edges.filter((e) => e.from !== id && e.to !== id);
      return p;
    });
    setSelId(null);
  };

  /* ---- canvas interaction ---- */
  const toWorld = (clientX, clientY) => {
    const r = canvasRef.current.getBoundingClientRect();
    const vp = project.viewport;
    return { x: (clientX - r.left - vp.x) / vp.z, y: (clientY - r.top - vp.y) / vp.z };
  };

  const onCanvasDown = (e) => {
    if (e.target !== e.currentTarget && !e.target.classList.contains("vrl-layer") && e.target.tagName !== "svg") return;
    dragRef.current = { mode: "pan", sx: e.clientX, sy: e.clientY, ox: project.viewport.x, oy: project.viewport.y };
    setSelId(null);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onNodeDown = (e, node) => {
    e.stopPropagation();
    setSelId(node.id);
    dragRef.current = { mode: "node", id: node.id, sx: e.clientX, sy: e.clientY, ox: node.x, oy: node.y };
    canvasRef.current.setPointerCapture?.(e.pointerId);
  };

  const onMove = (e) => {
    const d = dragRef.current;
    if (linking) {
      const w = toWorld(e.clientX, e.clientY);
      setLinking((l) => (l ? { ...l, x: w.x, y: w.y } : l));
    }
    if (!d) return;
    if (d.mode === "pan") {
      setProject((p) => ({ ...p, viewport: { ...p.viewport, x: d.ox + (e.clientX - d.sx), y: d.oy + (e.clientY - d.sy) } }));
    } else if (d.mode === "node") {
      const z = project.viewport.z;
      const nx = d.ox + (e.clientX - d.sx) / z, ny = d.oy + (e.clientY - d.sy) / z;
      setProject((p) => ({ ...p, nodes: p.nodes.map((n) => (n.id === d.id ? { ...n, x: nx, y: ny } : n)) }));
    }
  };

  const onUp = (e) => {
    if (dragRef.current?.mode === "node") setDirty(true);
    dragRef.current = null;
    if (linking) {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const target = el?.closest?.("[data-nodeid]");
      const to = target?.getAttribute("data-nodeid");
      if (to && to !== linking.from) {
        mutate((p) => {
          const exists = p.edges.some((x) => x.from === linking.from && x.to === to);
          const reverse = p.edges.some((x) => x.from === to && x.to === linking.from);
          if (!exists && !reverse) p.edges.push({ id: uid("e"), from: linking.from, to });
          return p;
        });
      }
      setLinking(null);
    }
  };

  const onWheel = (e) => {
    e.preventDefault();
    const r = canvasRef.current.getBoundingClientRect();
    setProject((p) => {
      const vp = p.viewport;
      const z = clamp(vp.z * (e.deltaY > 0 ? 0.92 : 1.08), 0.3, 2);
      const mx = e.clientX - r.left, my = e.clientY - r.top;
      return { ...p, viewport: { z, x: mx - ((mx - vp.x) / vp.z) * z, y: my - ((my - vp.y) / vp.z) * z } };
    });
  };

  const zoomBy = (f) => setProject((p) => {
    const r = canvasRef.current.getBoundingClientRect();
    const vp = p.viewport, z = clamp(vp.z * f, 0.3, 2);
    const mx = r.width / 2, my = r.height / 2;
    return { ...p, viewport: { z, x: mx - ((mx - vp.x) / vp.z) * z, y: my - ((my - vp.y) / vp.z) * z } };
  });

  const fitView = () => {
    if (!project) return;
    const r = canvasRef.current.getBoundingClientRect();
    const xs = project.nodes.map((n) => n.x), ys = project.nodes.map((n) => n.y);
    const minX = Math.min(...xs) - 40, minY = Math.min(...ys) - 40;
    const maxX = Math.max(...xs) + 300, maxY = Math.max(...ys) + 260;
    const z = clamp(Math.min(r.width / (maxX - minX), r.height / (maxY - minY)), 0.3, 1.2);
    setProject((p) => ({ ...p, viewport: { z, x: -minX * z + 20, y: -minY * z + 20 } }));
  };

  /* ---- images ---- */
  const handleUpload = async (file) => {
    if (!file || !pendingUpload.current) return;
    try {
      const dataURL = await fileToDataURL(file);
      const imgId = uid("img");
      await store.set(K.img(imgId), dataURL);
      setImages((p) => ({ ...p, [imgId]: dataURL }));
      const t = pendingUpload.current;
      if (t.kind === "base") patchNode(t.nodeId, { imageId: imgId });
      if (t.kind === "ref") {
        mutate((p) => {
          const n = p.nodes.find((x) => x.id === t.nodeId);
          if (n) n.data.items.push({ id: uid("ri"), imageId: imgId, category: "Material", title: file.name.replace(/\.[^.]+$/, ""), instruction: "" });
          return p;
        });
      }
      if (t.kind === "lib") {
        libPendingItems.current.push({ id: uid("li"), imageId: imgId, category: "Material", title: file.name.replace(/\.[^.]+$/, ""), instruction: "", folder: t.folder || "Unsorted" });
      }
    } catch (err) {
      say(err.message || "That image could not be added");
    }
    pendingUpload.current = null;
  };

  const dropFiles = async (node, fileList) => {
    const files = [...(fileList || [])].filter((f) => f.type.startsWith("image/"));
    if (!files.length) return;
    if (node.type === "base") { pendingUpload.current = { kind: "base", nodeId: node.id }; await handleUpload(files[0]); return; }
    for (const f of files) { pendingUpload.current = { kind: "ref", nodeId: node.id }; await handleUpload(f); }
    setSelId(node.id);
  };

  const pickImage = (kind, nodeId) => {
    pendingUpload.current = { kind, nodeId };
    fileRef.current.value = "";
    fileRef.current.click();
  };

  /* ---- project actions ---- */
  const newProject = async (scene = "Exterior") => {
    const p = starterProject(`${scene} render ${new Date().toLocaleDateString("en-GB")}`, scene);
    await saveProject(p, true);
    setProject(p); setSelId(null); setTab("nodes");
    say(`${scene} project created`);
  };

  const duplicateProject = async () => {
    const copy = structuredClone(project);
    copy.id = uid("proj"); copy.name = `${project.name} copy`; copy.createdAt = Date.now();
    await saveProject(copy, true);
    say(t("Project duplicated"));
  };

  const deleteProject = async (id) => {
    await store.del(K.proj(id));
    const next = index.filter((r) => r.id !== id);
    setIndex(next); await store.set(K.index, next);
    if (project?.id === id) {
      if (next.length) openProject(next[0].id);
      else setProject(starterProject("Vessu render — new project"));
    }
    say(t("Project deleted"));
  };

  const exportProject = () => {
    const bundle = { format: "vessu-render-lab.v1", project, images: {}, presets: presets.filter((p) => !p.builtin) };
    project.nodes.forEach((n) => {
      if (n.type === "base" && n.data.imageId) bundle.images[n.data.imageId] = images[n.data.imageId];
      if (n.type === "reference") n.data.items.forEach((i) => { if (i.imageId) bundle.images[i.imageId] = images[i.imageId]; });
    });
    downloadJSON(`${project.name.replace(/[^\w\-]+/g, "-").toLowerCase()}.vessu.json`, bundle);
    say(t("Project exported"));
  };

  const importProject = async (file) => {
    try {
      const text = await file.text();
      const b = JSON.parse(text);
      if (!b.project?.nodes) throw new Error("Not a Vessu Render Lab file");
      const p = { ...b.project, id: uid("proj"), name: `${b.project.name} (imported)`, updatedAt: Date.now() };
      const imgs = b.images || {};
      await Promise.all(Object.entries(imgs).map(([id, d]) => (d ? store.set(K.img(id), d) : null)));
      setImages((prev) => ({ ...prev, ...imgs }));
      if (b.presets?.length) savePresets([...presets, ...b.presets.filter((x) => !presets.some((y) => y.id === x.id))]);
      await saveProject(p, true);
      setSelId(null); setTab("nodes");
      say(t("Project imported"));
    } catch (err) {
      say(err.message || "That file could not be imported");
    }
  };

  /* ---- derived ---- */
  const liveIds = useMemo(() => (project ? new Set(connectedNodes(project).map((n) => n.id)) : new Set()), [project]);
  const masterPrompt = useMemo(() => (project ? buildPrompt(project, presets, "master") : ""), [project, presets]);
  const shortPrompt = useMemo(() => (project ? buildPrompt(project, presets, "short") : ""), [project, presets]);
  const revisionPrompt = useMemo(() => (project ? buildPrompt(project, presets, "revision") : ""), [project, presets]);
  const nextViewPrompt = useMemo(() => (project ? buildPrompt(project, presets, "nextview") : ""), [project, presets]);
  const selected = project?.nodes.find((n) => n.id === selId) || null;
  const baseNode = project?.nodes.find((n) => n.type === "base" && liveIds.has(n.id));
  const orderedRefs = useMemo(() => {
    if (!project) return [];
    return connectedNodes(project).filter((n) => n.type === "reference").flatMap((n) => n.data.items);
  }, [project]);

  if (!ready || !project) {
    return <div className="vrl"><style>{CSS}</style>
      <div style={{ margin: "auto", color: "#726c63", fontSize: 12 }}>Loading workspace…</div></div>;
  }

  const vp = project.viewport;

  /* ------------------------------ node body ------------------------------ */
  function NodeBody({ n }) {
    const d = n.data;
    switch (n.type) {
      case "base": return (
        <div className="vrl-node-bd">
          {d.imageId && images[d.imageId]
            ? <img className="vrl-thumb" style={{ height: 130 }} src={images[d.imageId]} alt="" />
            : <div className="vrl-thumb" style={{ height: 130, display: "grid", placeItems: "center", color: "var(--fg-3)", fontSize: 11, border: "1px dashed var(--line)" }}>
              Drop an image here or upload in the panel</div>}
          <div style={{ marginTop: 8 }}>
            <div className="vrl-row" style={{ gap: 4, marginBottom: 3 }}>
              <span className="vrl-tag">{d.space}</span>
              <span className="vrl-tag">{d.source}</span>
              {d.source === "SketchUp screenshot" && <span className="vrl-tag">{d.captureStyle || "Shaded with textures"}</span>}
            </div>
            <div>{d.projectName || <span className="k">Project name not set</span>}</div>
            {d.viewName && <div className="k">{d.viewName}</div>}
          </div>
        </div>
      );
      case "preset": {
        const p = presets.find((x) => x.id === d.presetId);
        return <div className="vrl-node-bd"><div>{p?.name || "Preset missing"}</div>
          <div className="k" style={{ marginTop: 4, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p?.visual}</div></div>;
      }
      case "lock": {
        const on = LOCK_FLAGS.filter(([k]) => d.flags[k]).length;
        return <div className="vrl-node-bd"><div>Strength: {d.strength}</div><div className="k">{on} of {LOCK_FLAGS.length} constraints active</div></div>;
      }
      case "ilock": {
        const on = ILOCK_FLAGS.filter(([k]) => d.flags[k]).length;
        return <div className="vrl-node-bd"><div>Strength: {d.strength}</div><div className="k">{on} of {ILOCK_FLAGS.length} constraints active</div></div>;
      }
      case "staging": return <div className="vrl-node-bd">
        <div>{d.roomUse}{d.program ? <span className="k"> · {d.program}</span> : null}</div>
        <div className="k">Occupancy {word(d.occupancy, S_AMT)} · {word(d.livedIn, ["empty", "lightly staged", "staged", "lived-in", "well lived-in"])}</div>
        <div className="k" style={{ marginTop: 4 }}>
          {(d.stagingMode || "Rebuild photorealistically").toLowerCase()}
          {(d.stagingMode || "Rebuild photorealistically") !== "Keep as drawn" &&
            ` · ${STAGING.filter(([k]) => (d.rebuild || {})[k] !== false).length}/${STAGING.length} elements`}
        </div></div>;
      case "reference": {
        const order = orderedRefs;
        return (
          <div className="vrl-node-bd">
            {d.items.length === 0 && <div className="k" style={{ padding: "6px 0" }}>No references yet. Drop images here.</div>}
            {d.items.slice(0, 5).map((it) => {
              const idx = order.findIndex((r) => r.id === it.id);
              return (
                <div key={it.id} className="vrl-ref-row">
                  <div className="vrl-ref-img">
                    <img src={images[it.imageId]} alt="" />
                    {idx >= 0 && <span className="vrl-ref-num">{idx + 1}</span>}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <span className="vrl-tag">{it.category}</span>
                    <div style={{ color: "var(--fg)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.title || "Untitled"}</div>
                    <div className="k vrl-clamp2" style={{ fontSize: 10.5, lineHeight: 1.4 }}>{it.instruction || "No instruction — what should be taken from this image?"}</div>
                  </div>
                </div>
              );
            })}
            {d.items.length > 5 && <div className="k" style={{ paddingTop: 6 }}>+{d.items.length - 5} more</div>}
            <button className="vrl-node-add" onClick={(e) => { e.stopPropagation(); pickImage("ref", n.id); }}>
              <Plus size={12} strokeWidth={1.4} />{t("Add reference")}</button>
          </div>
        );
      }
      case "legend": return <div className="vrl-node-bd">
        {d.items.length === 0 ? <span className="k">No legend entries</span> : d.items.slice(0, 5).map((it) => (
          <div key={it.id} className="vrl-row" style={{ gap: 6, marginBottom: 3 }}>
            <span style={{ width: 12, height: 12, borderRadius: 2, background: it.hex || "transparent", border: "1px solid var(--line)", flex: "none" }} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {it.element || it.appearsAs || (it.hex ? hexToName(it.hex) : "—")} <span className="k">→</span> {it.material || "—"}
            </span>
          </div>
        ))}
        {d.items.length > 5 && <div className="k">+{d.items.length - 5} more</div>}
      </div>;
      case "material": return <div className="vrl-node-bd">
        {d.items.length === 0 && <span className="k">No material instructions</span>}
        {d.items.slice(0, 4).map((m) => {
          const ref = m.refId ? orderedRefs.find((r) => r.id === m.refId) : null;
          const idx = ref ? orderedRefs.indexOf(ref) : -1;
          return (
            <div key={m.id} className="vrl-ref-row" style={{ alignItems: "center" }}>
              {ref ? (
                <div className="vrl-ref-img" style={{ width: 56, height: 40 }}>
                  <img src={images[ref.imageId]} alt="" />
                  <span className="vrl-ref-num">{idx + 1}</span>
                </div>
              ) : <div className="vrl-ref-img" style={{ width: 56, height: 40, border: "1px dashed var(--line-soft)", background: "transparent" }} />}
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ color: "var(--fg)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.element || "Element"}</div>
                <div className="k" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>→ {m.target || "target not set"}{m.finish ? ` · ${m.finish}` : ""}</div>
              </div>
            </div>
          );
        })}
        {d.items.length > 4 && <div className="k" style={{ paddingTop: 6 }}>+{d.items.length - 4} more</div>}
      </div>;
      case "lighting": return <div className="vrl-node-bd"><div>{d.time}</div>
        <div className="k">{word(d.brightness, S_LOW)} brightness · {word(d.warmth, S_LOW)} warmth</div>
        <div className="k" style={{ marginTop: 3 }}>{d.weather}</div></div>;
      case "context": return <div className="vrl-node-bd">
        <div>{d.location || <span className="k">No location set</span>}</div>
        <div className="k">People {word(d.people, S_AMT)} · cars {word(d.cars, S_AMT)}</div>
        <div className="k" style={{ marginTop: 4 }}>
          Entourage: {(d.entourageMode || "Rebuild photorealistically").toLowerCase()}
          {(d.entourageMode || "Rebuild photorealistically") !== "Keep as drawn" &&
            ` · ${ENTOURAGE.filter(([k]) => (d.rebuild || {})[k] !== false).length}/${ENTOURAGE.length} elements`}
        </div></div>;
      case "negative": return <div className="vrl-node-bd">
        <div>{d.rules.filter((r) => r.on).length} rules active</div>
        <div className="k" style={{ marginTop: 3 }}>{d.rules.filter((r) => r.on).slice(0, 2).map((r) => r.text).join(" · ")}</div></div>;
      case "revision": return <div className="vrl-node-bd"><div>{d.mode}</div>
        <div className="k">{d.note ? d.note.slice(0, 60) : "Used by the revision prompt only"}</div></div>;
      case "output": {
        const b = project.nodes.find((x) => x.type === "base" && liveIds.has(x.id));
        return <div className="vrl-node-bd">
          {(b?.data.imageId || orderedRefs.length > 0) && (
            <div className="vrl-strip">
              {b?.data.imageId && images[b.data.imageId] && (
                <img src={images[b.data.imageId]} alt="" title="Base image" style={{ borderColor: "var(--sand)" }} />
              )}
              {orderedRefs.slice(0, 8).map((r, i) => <img key={r.id} src={images[r.imageId]} alt="" title={`Reference ${i + 1} — ${r.title || ""}`} />)}
            </div>
          )}
          <div>{liveIds.size} node{liveIds.size === 1 ? "" : "s"} · {orderedRefs.length} reference{orderedRefs.length === 1 ? "" : "s"}</div>
          <div className="k" style={{ marginBottom: 8 }}>{masterPrompt.length.toLocaleString()} characters</div>
          <button className="vrl-btn pri" style={{ width: "100%", justifyContent: "center" }}
            onClick={(e) => { e.stopPropagation(); setModal("prompt"); }}>{t("Generate master prompt")}</button>
        </div>;
      }
      default: return null;
    }
  }

  /* ------------------------------- inspector ------------------------------ */
  function Inspector() {
    if (!selected) {
      return <div className="vrl-sec"><div className="vrl-empty">
        Select a node to edit it. Drag from the right-hand dot of one node to the left-hand dot of another to connect them — only nodes that reach the master prompt node are composed.
      </div></div>;
    }
    const n = selected, d = n.data;
    const set = (patch) => patchNode(n.id, patch);
    const setItems = (fn) => mutate((p) => { const t = p.nodes.find((x) => x.id === n.id); t.data.items = fn(t.data.items); return p; });

    return (
      <>
        <div className="vrl-sec vrl-row" style={{ justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 12 }}>{t(NT[n.type].label)}</div>
            <div style={{ fontSize: 10.5, color: "var(--fg-3)" }}>{liveIds.has(n.id) ? "Connected to master prompt" : "Not connected"}</div>
          </div>
          {n.type !== "output" && <button className="vrl-btn ghost" onClick={() => deleteNode(n.id)}><Trash2 size={13} strokeWidth={1.4} /></button>}
        </div>

        <div className="vrl-scroll">
          <div style={{ padding: 16 }}>
            {n.type === "base" && <>
              <Field label={t("Base image")}>
                {d.imageId && images[d.imageId] && <img className="vrl-thumb" style={{ height: 150, marginBottom: 8 }} src={images[d.imageId]} alt="" />}
                <div className="vrl-row" style={{ gap: 6 }}>
                  <button className="vrl-btn" onClick={() => pickImage("base", n.id)}><Upload size={13} strokeWidth={1.4} />{d.imageId ? "Replace" : "Upload"}</button>
                  {d.imageId && <button className="vrl-btn ghost" onClick={() => set({ imageId: null })}>{t("Remove")}</button>}
                </div>
              </Field>
              <Field label={t("Source")}>
                <select value={d.source} onChange={(e) => set({ source: e.target.value })}>
                  {["Clay render", "SketchUp screenshot", "Existing render"].map((o) => <option key={o} value={o}>{t(o)}</option>)}
                </select>
              </Field>
              {d.source === "SketchUp screenshot" && <>
                <Field label={t("Capture style")}>
                  <select value={d.captureStyle || "Shaded with textures"} onChange={(e) => set({ captureStyle: e.target.value })}>
                    {CAPTURE_STYLES.map((o) => <option key={o} value={o}>{t(o)}</option>)}
                  </select>
                </Field>
                <div style={{ fontSize: 11, color: "var(--fg-3)", lineHeight: 1.55, marginBottom: 12 }}>
                  {CAPTURE_READING[d.captureStyle || "Shaded with textures"]}
                  {!project.nodes.some((x) => x.type === "legend") && (
                    <div style={{ marginTop: 8 }}>
                      <button className="vrl-btn" onClick={() => addNode("legend")}><Plus size={13} strokeWidth={1.4} />{t("Add material legend")}</button>
                    </div>
                  )}
                </div>
              </>}
              <Field label={t("Project name")}><input value={d.projectName} onChange={(e) => set({ projectName: e.target.value })} placeholder="Synphaet Medical Center" /></Field>
              <Field label={t("View name")}><input value={d.viewName} onChange={(e) => set({ viewName: e.target.value })} placeholder="Main entrance approach" /></Field>
              <Field label={t("Scene")}>
                <div className="vrl-row" style={{ gap: 6 }}>
                  <span className="vrl-tag" style={{ marginBottom: 0 }}>{t(project.scene || d.space)}</span>
                  <span style={{ fontSize: 10.5, color: "var(--fg-3)" }}>{t("Change with the switch in the toolbar")}</span>
                </div>
              </Field>
            </>}

            {n.type === "preset" && <>
              <Field label={t("Preset")}>
                <select value={d.presetId} onChange={(e) => set({ presetId: e.target.value })}>
                  {presets.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </Field>
              <div className="vrl-row" style={{ gap: 6, marginBottom: 12 }}>
                <button className="vrl-btn" onClick={() => { setEditingPreset(structuredClone(presets.find((p) => p.id === d.presetId))); setModal("preset"); }}>
                  <Pencil size={13} strokeWidth={1.4} />{t("Edit")}</button>
                <button className="vrl-btn" onClick={() => {
                  const src = presets.find((p) => p.id === d.presetId);
                  const copy = { ...structuredClone(src), id: uid("p"), builtin: false, name: `${src.name} COPY` };
                  savePresets([...presets, copy]); set({ presetId: copy.id }); say(t("Preset duplicated"));
                }}><Files size={13} strokeWidth={1.4} />{t("Duplicate")}</button>
              </div>
              {(() => {
                const p = presets.find((x) => x.id === d.presetId);
                if (!p) return null;
                return ["visual", "material", "lighting", "photography", "landscaping", "realism", "negative"].map((k) => (
                  <div key={k} style={{ marginBottom: 10 }}>
                    <span className="vrl-lbl">{k}</span>
                    <div style={{ fontSize: 11.5, color: "var(--fg-2)", lineHeight: 1.55 }}>{p[k]}</div>
                  </div>
                ));
              })()}
            </>}

            {n.type === "lock" && <>
              <Field label={t("Architecture lock strength")}>
                <select value={d.strength} onChange={(e) => set({ strength: e.target.value })}>
                  {LOCK_STRENGTH.map((s) => <option key={s} value={s}>{t(s)}</option>)}
                </select>
              </Field>
              <div style={{ fontSize: 11, color: "var(--fg-3)", lineHeight: 1.55, marginBottom: 12 }}>{STRENGTH_NOTE[d.strength]}</div>
              <hr className="vrl-hr" />
              {LOCK_FLAGS.map(([k, label]) => (
                <Toggle key={k} on={!!d.flags[k]} label={t(label)}
                  onChange={(v) => set({ flags: { ...d.flags, [k]: v } })} />
              ))}
            </>}

            {n.type === "ilock" && <>
              <Field label={t("Interior lock strength")}>
                <select value={d.strength} onChange={(e) => set({ strength: e.target.value })}>
                  {LOCK_STRENGTH.map((s) => <option key={s} value={s}>{t(s)}</option>)}
                </select>
              </Field>
              <div style={{ fontSize: 11, color: "var(--fg-3)", lineHeight: 1.55, marginBottom: 12 }}>{STRENGTH_NOTE[d.strength]}</div>
              <hr className="vrl-hr" />
              {ILOCK_FLAGS.map(([k, label]) => (
                <Toggle key={k} on={!!d.flags[k]} label={t(label)}
                  onChange={(v) => set({ flags: { ...d.flags, [k]: v } })} />
              ))}
              <div className="vrl-empty" style={{ marginTop: 10 }}>
                Furniture layout and light fixture positions are locked here; their appearance is rebuilt by the Interior staging node.
              </div>
            </>}

            {n.type === "staging" && <>
              <Field label={t("Room use")}>
                <select value={d.roomUse} onChange={(e) => set({ roomUse: e.target.value })}>
                  {ROOM_USES.map((r) => <option key={r} value={r}>{t(r)}</option>)}
                </select>
              </Field>
              <Field label={t("Program and brief")}>
                <textarea value={d.program} placeholder="OPD waiting lounge for 40, family seating clusters, nurse station visible at the far end"
                  onChange={(e) => set({ program: e.target.value })} />
              </Field>
              <Field label={t("View through openings")}>
                <input value={d.viewContext || ""} placeholder="Courtyard garden, 3rd floor, city rooftops beyond"
                  onChange={(e) => set({ viewContext: e.target.value })} />
              </Field>
              <hr className="vrl-hr" />
              <Slider label={t("Occupancy")} value={d.occupancy} onChange={(v) => set({ occupancy: v })} scale={S_AMT} />
              <Slider label={t("Lived-in level")} value={d.livedIn} onChange={(v) => set({ livedIn: v })}
                scale={["empty", "lightly staged", "staged", "lived-in", "well lived-in"]} />
              <Slider label={t("Styling density")} value={d.styling} onChange={(v) => set({ styling: v })}
                scale={["minimal", "sparse", "moderate", "rich", "dense"]} />
              <hr className="vrl-hr" />
              <Field label={t("Furniture, styling and occupancy")}>
                <select value={d.stagingMode || "Rebuild photorealistically"} onChange={(e) => set({ stagingMode: e.target.value })}>
                  {STAGING_MODES.map((m) => <option key={m} value={m}>{t(m)}</option>)}
                </select>
              </Field>
              <div style={{ fontSize: 11, color: "var(--fg-3)", lineHeight: 1.55, marginBottom: 10 }}>
                {(d.stagingMode || "Rebuild photorealistically") === "Rebuild photorealistically"
                  ? t("Placeholder furniture, textiles, objects, plants, fittings and window views are detected and replaced with real ones. The room shell stays locked.")
                  : (d.stagingMode === "Enhance in place"
                    ? t("Existing furniture and styling are kept and raised to photographic quality.")
                    : t("Everything is left as drawn. Only material and light response improve."))}
              </div>
              {(d.stagingMode || "Rebuild photorealistically") !== "Keep as drawn" && <>
                <Field label={t("Furniture policy")}>
                  <select value={d.furniturePolicy || FURNITURE_POLICIES[0]} onChange={(e) => set({ furniturePolicy: e.target.value })}>
                    {FURNITURE_POLICIES.map((m) => <option key={m} value={m}>{t(m)}</option>)}
                  </select>
                </Field>
                {STAGING.map(([k, label]) => (
                  <Toggle key={k} label={t(label)} on={(d.rebuild || {})[k] !== false}
                    onChange={(v) => set({ rebuild: { ...(d.rebuild || {}), [k]: v } })} />
                ))}
                <div style={{ marginTop: 8 }}>
                  <Toggle label={t("Keep original positions and footprints")} on={d.keepFootprints !== false}
                    onChange={(v) => set({ keepFootprints: v })} />
                </div>
              </>}
            </>}

            {n.type === "reference" && <>
              <div className="vrl-row" style={{ gap: 6, marginBottom: 12 }}>
                <button className="vrl-btn" onClick={() => pickImage("ref", n.id)}><Plus size={13} strokeWidth={1.4} />{t("Add image")}</button>
                {refLib.length > 0 && <button className="vrl-btn" onClick={() => setTab("library")}>{t("From library")}</button>}
              </div>
              {d.items.length === 0 && <div className="vrl-empty">No references yet. Each image carries one instruction — what to take from it, and nothing more.</div>}
              {d.items.map((it, i) => (
                <div key={it.id} style={{ border: "1px solid var(--line-soft)", borderRadius: 2, padding: 10, marginBottom: 10 }}>
                  <div className="vrl-row" style={{ marginBottom: 8, alignItems: "flex-start" }}>
                    <img src={images[it.imageId]} alt="" style={{ width: 62, height: 46, objectFit: "cover", borderRadius: 2, background: "var(--sunken)" }} />
                    <div style={{ flex: 1, fontSize: 11, color: "var(--fg-3)" }}>Reference {i + 1}</div>
                    <button className="vrl-btn ghost" onClick={() => setItems((xs) => xs.filter((x) => x.id !== it.id))}><Trash2 size={12} strokeWidth={1.4} /></button>
                  </div>
                  <Field label={t("Category")}>
                    <select value={it.category} onChange={(e) => setItems((xs) => xs.map((x) => x.id === it.id ? { ...x, category: e.target.value } : x))}>
                      {REF_CATEGORIES.map((c) => <option key={c} value={c}>{t(c)}</option>)}
                    </select>
                  </Field>
                  <Field label={t("Title")}><input value={it.title} onChange={(e) => setItems((xs) => xs.map((x) => x.id === it.id ? { ...x, title: e.target.value } : x))} /></Field>
                  <Field label={t("Instruction")}>
                    <textarea value={it.instruction} placeholder="Use only the antique brass finish from this reference. Do not copy its geometry."
                      onChange={(e) => setItems((xs) => xs.map((x) => x.id === it.id ? { ...x, instruction: e.target.value } : x))} />
                  </Field>
                  <button className="vrl-btn ghost" style={{ fontSize: 11 }}
                    onClick={() => { saveRefLib([...refLib, { ...it, id: uid("li"), folder: project.name }]); say(`${t("Saved to library")} — ${project.name}`); }}>{t("Save to library")}</button>
                </div>
              ))}
            </>}

            {n.type === "legend" && (() => {
              const baseForLegend = project.nodes.find((x) => x.type === "base" && x.data.imageId && images[x.data.imageId]);
              const addEntry = (hex) => setItems((xs) => [...xs, {
                id: uid("lg"), hex: hex || "", appearsAs: hex ? hexToName(hex) : "", element: "", material: "", finish: "", size: "", note: "",
              }]);
              return <>
                {baseForLegend
                  ? <Eyedropper src={images[baseForLegend.data.imageId]} onPick={(hex) => { addEntry(hex); say(`${hex.toUpperCase()} added — ${hexToName(hex)}`); }} />
                  : <div className="vrl-empty" style={{ marginBottom: 10 }}>Upload a base image to sample colours from it. You can still add entries by element.</div>}
                <div className="vrl-row" style={{ gap: 6, marginBottom: 12 }}>
                  <button className="vrl-btn" onClick={() => addEntry("")}><Plus size={13} strokeWidth={1.4} />{t("Add by element")}</button>
                </div>
                <Field label={t("Fallback material for anything unlisted")}>
                  <input value={d.fallback || ""} placeholder="matte off-white plaster" onChange={(e) => set({ fallback: e.target.value })} />
                </Field>
                <Toggle label={t("Include capture-reading guards in the prompt")} on={d.guards !== false} onChange={(v) => set({ guards: v })} />
                <hr className="vrl-hr" />
                {d.items.length === 0 && <div className="vrl-empty">Each entry tells the AI: this colour or this element in the capture stands for that real material.</div>}
                {d.items.map((it, i) => (
                  <div key={it.id} style={{ border: "1px solid var(--line-soft)", borderRadius: 2, padding: 10, marginBottom: 10 }}>
                    <div className="vrl-row" style={{ marginBottom: 8 }}>
                      <label style={{ position: "relative", width: 28, height: 28, borderRadius: 2, border: "1px solid var(--line)", background: it.hex || "transparent", cursor: "pointer", flex: "none" }}>
                        <input type="color" value={it.hex || "#808080"} style={{ position: "absolute", inset: 0, opacity: 0, width: "100%", height: "100%", cursor: "pointer", padding: 0 }}
                          onChange={(e) => { const hex = e.target.value; setItems((xs) => xs.map((x) => x.id === it.id ? { ...x, hex, appearsAs: hexToName(hex) } : x)); }} />
                      </label>
                      <div style={{ flex: 1, fontSize: 11, color: "var(--fg-3)" }}>
                        Entry {i + 1}{it.hex ? ` · ${it.hex.toUpperCase()}` : ""}
                        {it.hex && <button className="vrl-btn ghost" style={{ height: 18, padding: "0 4px", fontSize: 10, marginLeft: 6 }}
                          onClick={() => setItems((xs) => xs.map((x) => x.id === it.id ? { ...x, hex: "" } : x))}>{t("no colour")}</button>}
                      </div>
                      <button className="vrl-btn ghost" onClick={() => setItems((xs) => xs.filter((x) => x.id !== it.id))}><Trash2 size={12} strokeWidth={1.4} /></button>
                    </div>
                    {[["appearsAs", "Appears in capture as", "flat light grey / SketchUp brick texture"],
                    ["element", "Where it appears", "ground-floor façade panels"],
                    ["material", "Real material", "fair-faced precast concrete"],
                    ["finish", "Finish", "matte, light form-tie pattern"],
                    ["size", "Module or size", "panels 1200 × 3000 mm"]].map(([k, label, ph]) => (
                      <Field key={k} label={t(label)}>
                        <input value={it[k] || ""} placeholder={ph}
                          onChange={(e) => setItems((xs) => xs.map((x) => x.id === it.id ? { ...x, [k]: e.target.value } : x))} />
                      </Field>
                    ))}
                    <Field label={t("Note")}>
                      <textarea value={it.note || ""} style={{ minHeight: 44 }} placeholder="Same colour on the roof fascia is aluminium, not concrete."
                        onChange={(e) => setItems((xs) => xs.map((x) => x.id === it.id ? { ...x, note: e.target.value } : x))} />
                    </Field>
                  </div>
                ))}
              </>;
            })()}

            {n.type === "material" && <>
              <button className="vrl-btn" style={{ marginBottom: 12 }}
                onClick={() => setItems((xs) => [...xs, { id: uid("m"), element: "", current: "", target: "", ref: "", refId: "", finish: "", scale: "", rough: "", reflect: "", instruction: "" }])}>
                <Plus size={13} strokeWidth={1.4} />{t("Add material")}</button>
              {d.items.length === 0 && <div className="vrl-empty">Name the element, then the target material. Everything unnamed keeps its existing material.</div>}
              {d.items.map((m) => (
                <div key={m.id} style={{ border: "1px solid var(--line-soft)", borderRadius: 2, padding: 10, marginBottom: 10 }}>
                  <div className="vrl-row" style={{ justifyContent: "flex-end", marginBottom: 4 }}>
                    <button className="vrl-btn ghost" onClick={() => setItems((xs) => xs.filter((x) => x.id !== m.id))}><Trash2 size={12} strokeWidth={1.4} /></button>
                  </div>
                  {[["element", "Element", "Reception counter"], ["current", "Current material", "White laminate"],
                  ["target", "Target material", "Antique brass"]].map(([k, label, ph]) => (
                      <Field key={k} label={t(label)}>
                        <input value={m[k]} placeholder={ph}
                          onChange={(e) => setItems((xs) => xs.map((x) => x.id === m.id ? { ...x, [k]: e.target.value } : x))} />
                      </Field>
                    ))}
                  <Field label={t("Reference image")}>
                    {(() => {
                      const allRefs = project.nodes.filter((x) => x.type === "reference").flatMap((x) => x.data.items);
                      const cur = allRefs.find((r) => r.id === m.refId);
                      return <>
                        <select value={m.refId || ""} onChange={(e) => setItems((xs) => xs.map((x) => x.id === m.id ? { ...x, refId: e.target.value } : x))}>
                          <option value="">{t("None")}</option>
                          {allRefs.map((r) => {
                            const idx = orderedRefs.findIndex((o) => o.id === r.id);
                            return <option key={r.id} value={r.id}>{idx >= 0 ? `[${idx + 1}] ` : "(not connected) "}{r.category} — {r.title || "Untitled"}</option>;
                          })}
                        </select>
                        {cur && <div className="vrl-row" style={{ gap: 8, marginTop: 6 }}>
                          <img src={images[cur.imageId]} alt="" style={{ width: 64, height: 46, objectFit: "cover", borderRadius: 2, background: "var(--sunken)" }} />
                          <div className="vrl-clamp2" style={{ fontSize: 10.5, color: "var(--fg-3)", lineHeight: 1.4 }}>{cur.instruction || "No instruction on this reference"}</div>
                        </div>}
                      </>;
                    })()}
                  </Field>
                  {[["finish", "Finish", "Brushed, lightly aged"], ["scale", "Texture scale", "Fine, ~2mm grain"],
                  ["rough", "Roughness", "Semi-matte, gentle diffusion"], ["reflect", "Reflectivity", "Low, directional highlights only"]]
                    .map(([k, label, ph]) => (
                      <Field key={k} label={t(label)}>
                        <input value={m[k]} placeholder={ph}
                          onChange={(e) => setItems((xs) => xs.map((x) => x.id === m.id ? { ...x, [k]: e.target.value } : x))} />
                      </Field>
                    ))}
                  <Field label={t("Instruction")}>
                    <textarea value={m.instruction} placeholder="Apply antique brass only to the counter front panels."
                      onChange={(e) => setItems((xs) => xs.map((x) => x.id === m.id ? { ...x, instruction: e.target.value } : x))} />
                  </Field>
                </div>
              ))}
            </>}

            {n.type === "lighting" && (() => {
              const sceneInterior = (project.scene || project.nodes.find((x) => x.type === "base")?.data.space) === "Interior";
              return <>
                <Field label={t("Time")}>
                  <select value={d.time} onChange={(e) => set({ time: e.target.value })}>
                    {TIME_PRESETS.map((x) => <option key={x} value={x}>{t(x)}</option>)}
                  </select>
                </Field>
                <hr className="vrl-hr" />
                <Slider label={t("Brightness")} value={d.brightness} onChange={(v) => set({ brightness: v })} />
                <Slider label={t("Contrast")} value={d.contrast} onChange={(v) => set({ contrast: v })} />
                <Slider label={t("Warmth")} value={d.warmth} onChange={(v) => set({ warmth: v })} />
                <Slider label={t(sceneInterior ? "View visibility through glazing" : "Interior visibility")} value={d.interior} onChange={(v) => set({ interior: v })} />
                <Slider label={t("Shadow softness")} value={d.shadow} onChange={(v) => set({ shadow: v })} />
                <Slider label={t("Sun intensity")} value={d.sun} onChange={(v) => set({ sun: v })} />
                <hr className="vrl-hr" />
                <Field label={t("Light direction")}><textarea value={d.direction} onChange={(e) => set({ direction: e.target.value })} /></Field>
                <Field label={t("Ambient description")}><textarea value={d.ambient} onChange={(e) => set({ ambient: e.target.value })} /></Field>

                {!sceneInterior && <>
                  <Field label={t("Weather")}><input value={d.weather} onChange={(e) => set({ weather: e.target.value })} /></Field>
                  <Field label={t("Sky description")}><textarea value={d.sky} onChange={(e) => set({ sky: e.target.value })} /></Field>
                </>}

                {sceneInterior && <>
                  <hr className="vrl-hr" />
                  <span className="vrl-lbl" style={{ marginBottom: 8 }}>{t("Daylight")}</span>
                  <Toggle label={t("Direct sun patches through openings")} on={d.directSun !== false} onChange={(v) => set({ directSun: v })} />
                  {d.directSun !== false && <Slider label={t("Sun patch softness")} value={d.sunPatch ?? 55} onChange={(v) => set({ sunPatch: v })}
                    scale={[t("hard-edged"), t("fairly crisp"), t("moderately soft"), t("soft"), t("very soft")]} />}
                  <Slider label={t("Exterior view exposure")} value={d.viewExposure ?? 70} onChange={(v) => set({ viewExposure: v })}
                    scale={[t("dark"), t("darker than room"), t("balanced"), t("brighter than room"), t("near white")]} />
                  <Field label={t("Blinds and curtains")}>
                    <select value={d.blinds || "Open"} onChange={(e) => set({ blinds: e.target.value })}>
                      {BLIND_STATES.map((x) => <option key={x} value={x}>{t(x)}</option>)}
                    </select>
                  </Field>
                  <Slider label={t("Daylight ↔ artificial balance")} value={d.daylightBalance ?? 70} onChange={(v) => set({ daylightBalance: v })}
                    scale={[t("artificial-led"), t("artificial with fill"), t("balanced"), t("daylight-led"), t("daylight only")]} />

                  <hr className="vrl-hr" />
                  <span className="vrl-lbl" style={{ marginBottom: 8 }}>{t("Artificial light")}</span>
                  <Field label={t("Amount of lighting design")}>
                    <select value={d.artificialLevel || "asdrawn"} onChange={(e) => set({ artificialLevel: e.target.value })}>
                      {ARTIFICIAL_LEVELS.map(([k, label]) => <option key={k} value={k}>{t(label)}</option>)}
                    </select>
                  </Field>
                  <div style={{ fontSize: 11, color: "var(--fg-3)", lineHeight: 1.55, marginBottom: 10 }}>
                    {t((ARTIFICIAL_LEVELS.find(([k]) => k === (d.artificialLevel || "asdrawn")) || ARTIFICIAL_LEVELS[1])[2])}
                  </div>
                  {(d.artificialLevel || "asdrawn") !== "off" && <>
                    <Field label={t("Colour temperature")}>
                      <select value={d.cct || "3000K"} onChange={(e) => set({ cct: e.target.value })}>
                        {CCT_OPTIONS.map((x) => <option key={x} value={x}>{t(x)}</option>)}
                      </select>
                    </Field>
                    <span className="vrl-lbl" style={{ marginBottom: 4 }}>{t("Fixture types allowed")}</span>
                    <div style={{ fontSize: 10.5, color: "var(--fg-3)", lineHeight: 1.5, marginBottom: 6 }}>
                      {t("Anything switched off is written into the prompt as prohibited unless it is physically modelled in the base image.")}
                    </div>
                    {FIXTURE_TYPES.map(([k, label]) => (
                      <Toggle key={k} label={t(label)} on={!!(d.fixtures || {})[k]}
                        onChange={(v) => set({ fixtures: { ...(d.fixtures || {}), [k]: v } })} />
                    ))}
                    <div style={{ marginTop: 8 }}>
                      <Field label={t("Lighting notes")}>
                        <textarea value={d.artificial || ""} placeholder={t("Pendants over the dining table only; wall lights dimmed low")}
                          onChange={(e) => set({ artificial: e.target.value })} />
                      </Field>
                    </div>
                  </>}
                </>}
              </>;
            })()}

            {n.type === "context" && <>
              <Field label={t("Location and context")}>
                <textarea value={d.location} placeholder="Chiang Rai urban street atmosphere" onChange={(e) => set({ location: e.target.value })} />
              </Field>
              <Slider label={t("People")} value={d.people} onChange={(v) => set({ people: v })} scale={S_AMT} />
              <Slider label={t("Cars")} value={d.cars} onChange={(v) => set({ cars: v })} scale={S_AMT} />
              <Slider label={t("Street activity")} value={d.street} onChange={(v) => set({ street: v })} scale={S_AMT} />
              <Slider label={t("Interior activity")} value={d.interiorAct} onChange={(v) => set({ interiorAct: v })} scale={S_AMT} />
              <Slider label={t("Landscape enhancement")} value={d.landscape} onChange={(v) => set({ landscape: v })} />
              <hr className="vrl-hr" />
              <Field label={t("Non-architectural elements")}>
                <select value={d.entourageMode || "Rebuild photorealistically"} onChange={(e) => set({ entourageMode: e.target.value })}>
                  {ENTOURAGE_MODES.map((m) => <option key={m} value={m}>{t(m)}</option>)}
                </select>
              </Field>
              <div style={{ fontSize: 11, color: "var(--fg-3)", lineHeight: 1.55, marginBottom: 10 }}>
                {(d.entourageMode || "Rebuild photorealistically") === "Rebuild photorealistically"
                  ? t("Placeholder trees, people, cars, sky and ground are detected and replaced with photographically real ones. The building stays locked.")
                  : (d.entourageMode === "Enhance in place"
                    ? t("Existing entourage is kept and raised to photographic quality.")
                    : t("Everything is left as drawn. Only material and light response improve."))}
              </div>
              {(d.entourageMode || "Rebuild photorealistically") !== "Keep as drawn" && <>
                {ENTOURAGE.map(([k, label]) => (
                  <Toggle key={k} label={t(label)} on={(d.rebuild || {})[k] !== false}
                    onChange={(v) => set({ rebuild: { ...(d.rebuild || {}), [k]: v } })} />
                ))}
                <div style={{ marginTop: 8 }}>
                  <Toggle label={t("Keep original positions and scale")} on={d.keepPositions !== false}
                    onChange={(v) => set({ keepPositions: v })} />
                </div>
              </>}
            </>}

            {n.type === "negative" && <>
              <div className="vrl-row" style={{ gap: 6, marginBottom: 10 }}>
                {[["Exterior set", DEFAULT_NEGATIVES], ["Interior set", INTERIOR_NEGATIVES]].map(([label, list]) => (
                  <button key={label} className="vrl-btn" style={{ flex: 1, justifyContent: "center" }} onClick={() => mutate((p) => {
                    const t = p.nodes.find((x) => x.id === n.id);
                    const have = new Set(t.data.rules.map((r) => r.text));
                    list.forEach((text) => { if (!have.has(text)) t.data.rules.push({ id: uid("r"), text, on: true }); });
                    return p;
                  })}>Load {label.toLowerCase()}</button>
                ))}
              </div>
              <div className="vrl-row" style={{ gap: 6, marginBottom: 12 }}>
                <input placeholder="Add a custom rule, then press Enter"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.currentTarget.value.trim()) {
                      const text = e.currentTarget.value.trim(); e.currentTarget.value = "";
                      mutate((p) => { p.nodes.find((x) => x.id === n.id).data.rules.push({ id: uid("r"), text, on: true }); return p; });
                    }
                  }} />
              </div>
              {d.rules.map((r) => (
                <div key={r.id} className="vrl-row" style={{ gap: 6 }}>
                  <div style={{ flex: 1 }}>
                    <Toggle on={r.on} label={r.text}
                      onChange={(v) => mutate((p) => { const t = p.nodes.find((x) => x.id === n.id); t.data.rules = t.data.rules.map((x) => x.id === r.id ? { ...x, on: v } : x); return p; })} />
                  </div>
                  <button className="vrl-btn ghost" onClick={() => mutate((p) => { const t = p.nodes.find((x) => x.id === n.id); t.data.rules = t.data.rules.filter((x) => x.id !== r.id); return p; })}>
                    <X size={12} strokeWidth={1.4} /></button>
                </div>
              ))}
            </>}

            {n.type === "revision" && <>
              <Field label={t("Revision type")}>
                <select value={d.mode} onChange={(e) => set({ mode: e.target.value })}>
                  {REVISION_MODES.map((m) => <option key={m} value={m}>{t(m)}</option>)}
                </select>
              </Field>
              <Field label={t("What exactly should change")}>
                <textarea value={d.note} style={{ minHeight: 90 }}
                  placeholder="Replace the timber screen on the left bay with vertical aluminium fins at 100mm centres. Nothing else changes."
                  onChange={(e) => set({ note: e.target.value })} />
              </Field>
              <div className="vrl-empty">This node does not affect the master prompt. Open the prompt panel and switch to Revision to use it.</div>
            </>}

            {n.type === "output" && <>
              <div className="vrl-empty" style={{ marginBottom: 12 }}>
                {t("Every node that reaches this one is composed into the master prompt. Disconnect a node to leave it out without deleting it.")}
              </div>
              <hr className="vrl-hr" />
              <Toggle label={t("Series consistency — carry the accepted look to later views")} on={d.series !== false} onChange={(v) => set({ series: v })} />
              <div style={{ fontSize: 11, color: "var(--fg-3)", lineHeight: 1.55, margin: "4px 0 10px" }}>
                {t("Adds section 11 to the master prompt and enables the next-view prompt. Later base images of the same project inherit materials, lighting, colour grade, entourage and photographic treatment from the render you accepted.")}
              </div>
              <Field label={t("Accepted render note")}>
                <input value={d.approvedNote || ""} placeholder={t("e.g. main entrance view, second attempt")} onChange={(e) => set({ approvedNote: e.target.value })} />
              </Field>
            </>}
          </div>
        </div>
      </>
    );
  }

  /* ------------------------------- sidebar -------------------------------- */
  function Sidebar() {
    return (
      <div className="vrl-panel vrl-hide-sm" style={{ width: 240 }}>
        <div className="vrl-tabs">
          {[["nodes", Layers, "Nodes", "Add and edit nodes"], ["projects", FolderOpen, "Projects", "Open, create, delete"],
          ["presets", ClipboardList, "Presets", "Vessu style presets"], ["library", ImageIcon, "Library", "Shared references"]].map(([id, Icon, label, hint]) => (
            <button key={id} className={`vrl-tabbtn${tab === id ? " on" : ""}`} onClick={() => setTab(id)} title={t(hint)}>
              <Icon size={17} strokeWidth={1.3} />
              <span>{t(label)}</span>
            </button>
          ))}
        </div>

        <div className="vrl-scroll">
          {tab === "nodes" && <div className="vrl-sec">
            <h4>{t("Add node")}</h4>
            {SCENE_NODES[project.scene || "Exterior"].map((ty) => [ty, NT[ty]]).map(([ty, meta]) => (
              <button key={ty} className="vrl-list-item" style={{ padding: "7px 0", borderLeft: "none" }} onClick={() => addNode(ty)}>
                <span className="vrl-row" style={{ gap: 8 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 1, background: meta.color, flex: "none" }} />
                  <span style={{ flex: 1 }}>{t(meta.label)}</span>
                  <Plus size={12} strokeWidth={1.4} />
                </span>
              </button>
            ))}
          </div>}

          {tab === "projects" && <>
            <div className="vrl-sec" style={{ display: "grid", gap: 6 }}>
              <button className="vrl-btn pri" style={{ justifyContent: "center" }} onClick={() => newProject("Exterior")}>
                <Plus size={13} strokeWidth={1.4} />{t("New exterior project")}</button>
              <button className="vrl-btn pri" style={{ justifyContent: "center" }} onClick={() => newProject("Interior")}>
                <Plus size={13} strokeWidth={1.4} />{t("New interior project")}</button>
            </div>
            {index.length === 0 && <div className="vrl-sec"><div className="vrl-empty">No saved projects yet. Save the current one to start a library.</div></div>}
            {index.map((r) => (
              <div key={r.id} className="vrl-row" style={{ gap: 0 }}>
                <button className={`vrl-list-item${r.id === project.id ? " sel" : ""}`} style={{ flex: 1 }} onClick={() => openProject(r.id)}>
                  <div style={{ fontSize: 12 }}>{r.name}</div>
                  <div style={{ fontSize: 10.5, color: "var(--fg-3)" }}>{new Date(r.updatedAt).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
                </button>
                <button className="vrl-btn ghost" style={{ marginRight: 8 }} onClick={() => deleteProject(r.id)}><Trash2 size={12} strokeWidth={1.4} /></button>
              </div>
            ))}
          </>}

          {tab === "presets" && <>
            <div className="vrl-sec"><button className="vrl-btn" style={{ width: "100%", justifyContent: "center" }}
              onClick={() => { setEditingPreset({ id: uid("p"), builtin: false, name: "NEW VESSU PRESET", visual: "", material: "", lighting: "", photography: "", landscaping: "", realism: "", negative: "" }); setModal("preset"); }}>
              <Plus size={13} strokeWidth={1.4} />{t("New preset")}</button></div>
            {presets.map((p) => (
              <div key={p.id} className="vrl-row" style={{ gap: 0 }}>
                <button className="vrl-list-item" style={{ flex: 1 }} onClick={() => { setEditingPreset(structuredClone(p)); setModal("preset"); }}>
                  <div style={{ fontSize: 11.5 }}>{p.name}</div>
                  <div style={{ fontSize: 10.5, color: "var(--fg-3)" }}>{p.builtin ? "Built in" : "Custom"}</div>
                </button>
                {!p.builtin && <button className="vrl-btn ghost" style={{ marginRight: 8 }}
                  onClick={() => savePresets(presets.filter((x) => x.id !== p.id))}><Trash2 size={12} strokeWidth={1.4} /></button>}
              </div>
            ))}
          </>}

          {tab === "library" && (() => {
            const folders = [...new Set(refLib.map((it) => it.folder || "Unsorted"))].sort((a, b) => a.localeCompare(b));
            const useItem = (it) => {
              const target = (selected?.type === "reference" ? selected : null) || project.nodes.find((x) => x.type === "reference");
              if (!target) { say(t("Add a reference node first")); return; }
              mutate((p) => { p.nodes.find((x) => x.id === target.id).data.items.push({ id: uid("ri"), imageId: it.imageId, category: it.category, title: it.title, instruction: it.instruction || "" }); return p; });
              setSelId(target.id);
              say(t("Added to reference node"));
            };
            const patchItem = (id, patch) => saveRefLib(refLib.map((x) => (x.id === id ? { ...x, ...patch } : x)));

            if (libFolder === null) return <>
              <div className="vrl-sec">
                <div className="vrl-row" style={{ gap: 6 }}>
                  <input value={libNewFolder} placeholder={t("New folder name")} onChange={(e) => setLibNewFolder(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && libNewFolder.trim()) { setLibFolder(libNewFolder.trim()); setLibNewFolder(""); } }} />
                  <button className="vrl-btn" disabled={!libNewFolder.trim()} onClick={() => { setLibFolder(libNewFolder.trim()); setLibNewFolder(""); }}>
                    <Plus size={13} strokeWidth={1.4} /></button>
                </div>
              </div>
              {folders.length === 0 && <div className="vrl-sec"><div className="vrl-empty">{t("Create a folder, then add images to it. Everything here is available to every project.")}</div></div>}
              {folders.map((f) => {
                const items = refLib.filter((it) => (it.folder || "Unsorted") === f);
                return (
                  <button key={f} className="vrl-list-item vrl-folder" onClick={() => setLibFolder(f)}>
                    <div className="vrl-folder-thumbs">
                      {items.slice(0, 3).map((it) => <img key={it.id} src={images[it.imageId]} alt="" />)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: "var(--fg)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f}</div>
                      <div style={{ fontSize: 10.5, color: "var(--fg-3)" }}>{items.length} {t(items.length === 1 ? "image" : "images")}</div>
                    </div>
                    <FolderOpen size={14} strokeWidth={1.3} style={{ color: "var(--fg-3)", flex: "none" }} />
                  </button>
                );
              })}
            </>;

            const items = refLib.filter((it) => (it.folder || "Unsorted") === libFolder);
            return <>
              <div className="vrl-sec">
                <div className="vrl-row" style={{ marginBottom: 10 }}>
                  <button className="vrl-btn ghost" onClick={() => setLibFolder(null)} title={t("All folders")}>‹ {t("Folders")}</button>
                  <div style={{ flex: 1, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{libFolder}</div>
                </div>
                <button className="vrl-btn pri" style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => { multiRef.current.value = ""; multiRef.current.click(); }}>
                  <Upload size={13} strokeWidth={1.4} />{t("Add images to this folder")}</button>
              </div>
              {items.length === 0 && <div className="vrl-sec"><div className="vrl-empty">{t("No images in this folder yet.")}</div></div>}
              {items.map((it) => (
                <div key={it.id} className="vrl-lib-item">
                  <img src={images[it.imageId]} alt=""
                    onError={async () => { const d = await store.get(K.img(it.imageId)); if (d) setImages((p) => ({ ...p, [it.imageId]: d })); }} />
                  <input value={it.title} onChange={(e) => patchItem(it.id, { title: e.target.value })}
                    style={{ background: "transparent", border: "1px solid transparent", padding: "3px 4px", fontSize: 11.5 }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--line)")} onBlur={(e) => (e.target.style.borderColor = "transparent")} />
                  <div className="vrl-row" style={{ gap: 6 }}>
                    <select value={it.category} onChange={(e) => patchItem(it.id, { category: e.target.value })} style={{ flex: 1, padding: "3px 22px 3px 6px", fontSize: 10.5 }}>
                      {REF_CATEGORIES.map((c) => <option key={c} value={c}>{t(c)}</option>)}
                    </select>
                    <select value={it.folder || "Unsorted"} onChange={(e) => patchItem(it.id, { folder: e.target.value })} title={t("Move to folder")}
                      style={{ flex: 1, padding: "3px 22px 3px 6px", fontSize: 10.5 }}>
                      {folders.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div className="vrl-row" style={{ gap: 6, marginTop: 6 }}>
                    <button className="vrl-btn pri" style={{ flex: 1, justifyContent: "center" }} onClick={() => useItem(it)}>
                      <Plus size={12} strokeWidth={1.4} />{t("Use in this project")}</button>
                    <button className="vrl-btn ghost" onClick={() => saveRefLib(refLib.filter((x) => x.id !== it.id))} title={t("Remove")}>
                      <Trash2 size={12} strokeWidth={1.4} /></button>
                  </div>
                </div>
              ))}
            </>;
          })()}
        </div>
      </div>
    );
  }

  /* --------------------------------- render ------------------------------- */
  const edgePath = (a, b) => {
    const dx = Math.max(46, Math.abs(b.x - a.x) * 0.45);
    return `M ${a.x} ${a.y} C ${a.x + dx} ${a.y}, ${b.x - dx} ${b.y}, ${b.x} ${b.y}`;
  };
  const portPos = (n, side) => ({ x: n.x + (side === "out" ? NODE_W(n.type) : 0), y: n.y + 15 });

  return (
    <div className="vrl">
      <style>{CSS}</style>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
        onChange={(e) => handleUpload(e.target.files?.[0])} />
      <input ref={multiRef} type="file" accept="image/*" multiple style={{ display: "none" }}
        onChange={(e) => { uploadManyToLibrary(e.target.files, libFolder || "Unsorted"); e.target.value = ""; }} />
      <input ref={importRef} type="file" accept="application/json,.json" style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) importProject(f); e.target.value = ""; }} />

      {/* toolbar */}
      <div className="vrl-row" style={{ height: 50, padding: "0 14px", borderBottom: "1px solid var(--line-soft)", background: "var(--surface)", flex: "none" }}>
        <div style={{ fontSize: 12, letterSpacing: ".14em", color: "var(--fg)" }}>vessu</div>
        <div style={{ fontSize: 10.5, letterSpacing: ".1em", color: "var(--fg-3)", marginLeft: -3 }}>RENDER LAB</div>
        <div style={{ width: 1, height: 20, background: "var(--line)", margin: "0 6px" }} />
        <div className="vrl-seg">
          {["Exterior", "Interior"].map((sc) => (
            <button key={sc} className={(project.scene || "Exterior") === sc ? "on" : ""} onClick={() => setScene(sc)}>{t(sc)}</button>
          ))}
        </div>
        <div style={{ width: 1, height: 20, background: "var(--line)", margin: "0 6px" }} />
        <input value={project.name} onChange={(e) => { const v = e.target.value; setProject((p) => ({ ...p, name: v })); setDirty(true); }}
          style={{ width: 240, background: "transparent", border: "1px solid transparent", fontSize: 12.5 }}
          onFocus={(e) => (e.target.style.borderColor = "var(--line)")} onBlur={(e) => (e.target.style.borderColor = "transparent")} />
        {dirty && <span style={{ fontSize: 10.5, color: "var(--fg-3)" }}>unsaved</span>}
        <div style={{ flex: 1 }} />
        <button className="vrl-btn" onClick={() => saveProject()}><Save size={13} strokeWidth={1.4} /><span className="vrl-hide-sm">{t("Save")}</span></button>
        <button className="vrl-btn" onClick={duplicateProject}><Files size={13} strokeWidth={1.4} /><span className="vrl-hide-sm">{t("Duplicate")}</span></button>
        <button className="vrl-btn" onClick={() => importRef.current.click()}><Upload size={13} strokeWidth={1.4} /><span className="vrl-hide-sm">{t("Import")}</span></button>
        <button className="vrl-btn" onClick={exportProject}><Download size={13} strokeWidth={1.4} /><span className="vrl-hide-sm">{t("Export")}</span></button>
        <button className="vrl-btn" onClick={() => { setPromptTab("master"); setModal("prompt"); }}>{t("Generate master prompt")}</button>
        <button className="vrl-btn pri" onClick={() => setModal("chatgpt")}>{t("Prepare for ChatGPT")}</button>
        <div className="vrl-seg" style={{ marginLeft: 4 }} title={t("Interface language. Prompts are always written in English.")}>
          {[["en", "EN"], ["th", "ไทย"]].map(([id, l]) => (
            <button key={id} className={lang === id ? "on" : ""} onClick={() => { setLang(id); store.set("vrl:settings", { lang: id }); }}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        {Sidebar()}

        {/* canvas */}
        <div ref={canvasRef} className={`vrl-canvas${dragRef.current?.mode === "pan" ? " grabbing" : ""}`}
          style={{ backgroundSize: `${26 * vp.z}px ${26 * vp.z}px`, backgroundPosition: `${vp.x}px ${vp.y}px` }}
          onPointerDown={onCanvasDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onWheel={onWheel}
          onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); setDropId(null); }}>

          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "visible" }}>
            <g transform={`translate(${vp.x},${vp.y}) scale(${vp.z})`}>
              {project.edges.map((e) => {
                const a = project.nodes.find((n) => n.id === e.from), b = project.nodes.find((n) => n.id === e.to);
                if (!a || !b) return null;
                const live = liveIds.has(a.id) || b.type === "output";
                return (
                  <g key={e.id}>
                    <path d={edgePath(portPos(a, "out"), portPos(b, "in"))} fill="none"
                      stroke={live ? "#2f6b64" : "#332f2a"} strokeWidth={1.4} />
                    <path d={edgePath(portPos(a, "out"), portPos(b, "in"))} fill="none" stroke="transparent" strokeWidth={12}
                      style={{ pointerEvents: "stroke", cursor: "pointer" }}
                      onPointerDown={(ev) => { ev.stopPropagation(); mutate((p) => { p.edges = p.edges.filter((x) => x.id !== e.id); return p; }); }} />
                  </g>
                );
              })}
              {linking && (() => {
                const a = project.nodes.find((n) => n.id === linking.from);
                return a ? <path d={edgePath(portPos(a, "out"), { x: linking.x, y: linking.y })} fill="none" stroke="#2dd2aa" strokeWidth={1.4} strokeDasharray="4 3" /> : null;
              })()}
            </g>
          </svg>

          <div className="vrl-layer" style={{ transform: `translate(${vp.x}px,${vp.y}px) scale(${vp.z})` }}>
            {project.nodes.map((n) => (
              <div key={n.id} data-nodeid={n.id}
                className={`vrl-node${selId === n.id ? " sel" : ""}${liveIds.has(n.id) || n.type === "output" ? "" : " off"}${dropId === n.id ? " drop" : ""}`}
                style={{ left: n.x, top: n.y, width: NODE_W(n.type), "--nc": NT[n.type].color }}
                onDragOver={(e) => { if (n.type === "base" || n.type === "reference") { e.preventDefault(); if (dropId !== n.id) setDropId(n.id); } }}
                onDragLeave={() => { if (dropId === n.id) setDropId(null); }}
                onDrop={(e) => { if (n.type === "base" || n.type === "reference") { e.preventDefault(); setDropId(null); dropFiles(n, e.dataTransfer.files); } }}
                onPointerDown={(e) => { if (e.target.closest("button,input,select,textarea,.vrl-port")) return; onNodeDown(e, n); }}>
                {n.type !== "base" && n.type !== "preset" && <div className="vrl-port in" title="Input" />}
                {n.type !== "output" && (
                  <div className="vrl-port out" title="Drag to connect"
                    onPointerDown={(e) => { e.stopPropagation(); const w = toWorld(e.clientX, e.clientY); setLinking({ from: n.id, x: w.x, y: w.y }); canvasRef.current.setPointerCapture?.(e.pointerId); }} />
                )}
                <div className="vrl-node-hd" onPointerDown={(e) => onNodeDown(e, n)}>
                  <span className="vrl-node-ttl">{t(NT[n.type].label)}</span>
                </div>
                {NodeBody({ n })}
              </div>
            ))}
          </div>

          {/* canvas controls */}
          <div className="vrl-row" style={{ position: "absolute", left: 14, bottom: 14, gap: 6 }}>
            <button className="vrl-btn" onClick={() => zoomBy(1.15)}><Plus size={13} strokeWidth={1.4} /></button>
            <button className="vrl-btn" onClick={() => zoomBy(0.87)}><Minus size={13} strokeWidth={1.4} /></button>
            <button className="vrl-btn" onClick={fitView}><Crosshair size={13} strokeWidth={1.4} />{t("Fit")}</button>
            <span style={{ fontSize: 10.5, color: "var(--fg-3)", marginLeft: 4 }}>{Math.round(vp.z * 100)}%</span>
          </div>

          {toast && <div style={{
            position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)",
            background: "var(--raised)", border: "1px solid var(--line)", borderRadius: 2,
            padding: "7px 14px", fontSize: 11.5, color: "var(--fg-2)"
          }}>{toast}</div>}
        </div>

        {/* inspector */}
        <div className="vrl-panel vrl-hide-sm" style={{ width: 330, borderRight: "none", borderLeft: "1px solid var(--line-soft)" }}>
          {Inspector()}
        </div>
      </div>

      {/* ------------------------------ modals ------------------------------ */}
      {modal === "prompt" && (
        <Modal wide title={t("Master prompt")} onClose={() => setModal(null)}
          footer={<>
            <CopyButton text={{ master: masterPrompt, short: shortPrompt, nextview: nextViewPrompt, revision: revisionPrompt }[promptTab]}
              label={t({ master: "Copy master prompt", short: "Copy short prompt", nextview: "Copy next-view prompt", revision: "Copy revision prompt" }[promptTab])} primary />
          </>}>
          <div className="vrl-row" style={{ gap: 4, marginBottom: 14, borderBottom: "1px solid var(--line-soft)" }}>
            {[["master", "Master"], ["short", "Short"], ["nextview", "Next view"], ["revision", "Revision"]].map(([id, l]) => (
              <button key={id} className={`vrl-tab${promptTab === id ? " on" : ""}`} onClick={() => setPromptTab(id)}>{t(l)}</button>
            ))}
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 10.5, color: "var(--fg-3)" }}>
              {(promptTab === "master" ? masterPrompt : promptTab === "short" ? shortPrompt : revisionPrompt).length.toLocaleString()} characters
            </span>
          </div>
          {promptTab === "nextview" && <div style={{ fontSize: 11.5, color: "var(--fg-2)", lineHeight: 1.55, marginBottom: 12 }}>
            {t("Send this with the next base image of the same project, in the same ChatGPT conversation, after a render you are happy with.")}
          </div>}
          <div className="vrl-pre">{{ master: masterPrompt, short: shortPrompt, nextview: nextViewPrompt, revision: revisionPrompt }[promptTab]}</div>
        </Modal>
      )}

      {modal === "chatgpt" && (
        <Modal wide title={t("Prepare for ChatGPT")} onClose={() => setModal(null)}
          footer={<>
            <CopyButton text={nextViewPrompt} label={t("Copy next-view prompt")} />
            <CopyButton text={shortPrompt} label={t("Copy short prompt")} />
            <CopyButton text={masterPrompt} label={t("Copy master prompt")} />
            <button className="vrl-btn pri" onClick={async () => {
              await copyText(masterPrompt);
              const ok = openChatGPT(masterPrompt);
              say(ok ? t("ChatGPT opened with the prompt — it is also on your clipboard") : t("Pop-up blocked — the prompt is on your clipboard"));
            }}>{t("Open ChatGPT with master prompt")}</button>
          </>}>
          <div style={{ fontSize: 11.5, color: "var(--fg-2)", lineHeight: 1.55, marginBottom: 18, paddingBottom: 14, borderBottom: "1px solid var(--line-soft)" }}>
            {t("Open ChatGPT with the prompt pre-filled, then paste each image into the same message with Ctrl+V / ⌘V in the order shown. Send once everything is attached.")}
          </div>

          <div style={{ marginBottom: 22 }}>
            <div className="vrl-lbl">{t("Step 1")}</div>
            <div style={{ marginBottom: 10 }}>{t("Base image — copy, then paste into ChatGPT.")}</div>
            {baseNode?.data.imageId && images[baseNode.data.imageId]
              ? <div className="vrl-row" style={{ alignItems: "flex-start", gap: 12 }}>
                <img src={images[baseNode.data.imageId]} alt="" style={{ width: 220, height: 142, objectFit: "cover", borderRadius: 2, border: "1px solid var(--line)" }} />
                <div style={{ display: "grid", gap: 6 }}>
                  <CopyImageButton src={images[baseNode.data.imageId]} label={t("Copy base image")} />
                  <div style={{ fontSize: 10.5, color: "var(--fg-3)" }}>{baseNode.data.viewName || baseNode.data.projectName || t("Base image")}</div>
                </div>
              </div>
              : <div className="vrl-empty">{t("No base image is connected. Add a base image node and upload your clay render or SketchUp screenshot.")}</div>}
          </div>

          <div style={{ marginBottom: 22 }}>
            <div className="vrl-lbl">{t("Step 2")}</div>
            <div style={{ marginBottom: 10 }}>{t("Reference images — copy and paste each one, in this order.")}</div>
            {orderedRefs.length === 0 ? <div className="vrl-empty">{t("No reference images connected. The prompt will run without them.")}</div> : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(168px,1fr))", gap: 10 }}>
                {orderedRefs.map((r, i) => (
                  <div key={r.id}>
                    <div style={{ position: "relative" }}>
                      <img src={images[r.imageId]} alt="" style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 2, border: "1px solid var(--line)" }} />
                      <span style={{
                        position: "absolute", top: 6, left: 6, background: "rgba(16,15,13,.85)",
                        border: "1px solid var(--line)", borderRadius: 2, padding: "1px 6px", fontSize: 10.5
                      }}>{i + 1}</span>
                    </div>
                    <div style={{ fontSize: 11, marginTop: 5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title || t("Untitled")}</div>
                    <div style={{ fontSize: 10.5, color: "var(--fg-3)", marginBottom: 5 }}>{t(r.category)}</div>
                    <CopyImageButton src={images[r.imageId]} label={`${t("Copy")} ${i + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="vrl-lbl">{t("Step 3")}</div>
            <div style={{ marginBottom: 10 }}>{t("Prompt — pre-filled when you open ChatGPT from the button below; paste it manually if the box is empty. Use the short prompt for fast iterations.")}</div>
            <div className="vrl-pre" style={{ maxHeight: 220 }}>{masterPrompt}</div>
          </div>

          <div style={{ marginTop: 22 }}>
            <div className="vrl-lbl">{t("Step 4")}</div>
            <div style={{ marginBottom: 6 }}>{t("For every further view of the same project: upload the next base image in the same conversation and send the next-view prompt. The accepted render becomes the reference for materials, light and entourage.")}</div>
          </div>
        </Modal>
      )}

      {modal === "preset" && editingPreset && (
        <Modal title={editingPreset.builtin ? "Preset — built in" : "Edit preset"} onClose={() => { setModal(null); setEditingPreset(null); }}
          footer={<>
            {editingPreset.builtin && <span style={{ fontSize: 11, color: "var(--fg-3)", marginRight: "auto" }}>
              Built-in presets are read-only. Duplicate to make it editable.</span>}
            <button className="vrl-btn" onClick={() => {
              const copy = { ...structuredClone(editingPreset), id: uid("p"), builtin: false, name: `${editingPreset.name} COPY` };
              savePresets([...presets, copy]); setEditingPreset(copy); say(t("Preset duplicated"));
            }}>{t("Duplicate")}</button>
            {!editingPreset.builtin && <button className="vrl-btn pri" onClick={() => {
              const exists = presets.some((p) => p.id === editingPreset.id);
              savePresets(exists ? presets.map((p) => (p.id === editingPreset.id ? editingPreset : p)) : [...presets, editingPreset]);
              setModal(null); setEditingPreset(null); say(t("Preset saved"));
            }}>{t("Save preset")}</button>}
          </>}>
          <Field label={t("Name")}>
            <input value={editingPreset.name} disabled={editingPreset.builtin}
              onChange={(e) => setEditingPreset({ ...editingPreset, name: e.target.value })} />
          </Field>
          {[["visual", "Visual style description"], ["material", "Material behaviour"], ["lighting", "Lighting behaviour"],
          ["photography", "Photography behaviour"], ["landscaping", "Landscaping behaviour"], ["realism", "Realism rules"],
          ["negative", "Negative rules"]].map(([k, label]) => (
            <Field key={k} label={t(label)}>
              <textarea value={editingPreset[k]} disabled={editingPreset.builtin} style={{ minHeight: 74 }}
                onChange={(e) => setEditingPreset({ ...editingPreset, [k]: e.target.value })} />
            </Field>
          ))}
        </Modal>
      )}
    </div>
  );
}
