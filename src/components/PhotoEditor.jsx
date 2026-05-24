import { useState, useRef, useEffect, useCallback } from "react";
import { T } from "../utils/tokens";

const FILTERS = [
  { id: "none", name: "Original", css: "none" },
  { id: "clarendon", name: "Clarendon", css: "contrast(1.2) saturate(1.35)" },
  { id: "gingham", name: "Gingham", css: "brightness(1.05) hue-rotate(-10deg) saturate(0.8)" },
  { id: "moon", name: "Moon", css: "grayscale(1) contrast(1.1) brightness(1.1)" },
  { id: "lark", name: "Lark", css: "contrast(0.9) brightness(1.15) saturate(1.2)" },
  { id: "reyes", name: "Reyes", css: "sepia(0.22) brightness(1.1) contrast(0.85) saturate(0.75)" },
  { id: "juno", name: "Juno", css: "contrast(1.15) saturate(1.8) sepia(0.08)" },
  { id: "aden", name: "Aden", css: "hue-rotate(-20deg) contrast(0.9) saturate(0.85) brightness(1.2)" },
  { id: "ludwig", name: "Ludwig", css: "contrast(1.05) saturate(0.9) sepia(0.08) brightness(1.05)" },
  { id: "valencia", name: "Valencia", css: "sepia(0.15) saturate(1.5) contrast(1.08)" },
  { id: "nashville", name: "Nashville", css: "sepia(0.25) contrast(1.2) brightness(1.05) saturate(1.2) hue-rotate(-15deg)" },
  { id: "perpetua", name: "Perpetua", css: "brightness(1.1) saturate(1.1) contrast(0.95)" },
];

const CROP_RATIOS = [
  { id: "free", label: "Libre", ratio: null },
  { id: "1:1", label: "1:1", ratio: 1 },
  { id: "4:3", label: "4:3", ratio: 4/3 },
  { id: "3:4", label: "3:4", ratio: 3/4 },
  { id: "16:9", label: "16:9", ratio: 16/9 },
  { id: "9:16", label: "9:16", ratio: 9/16 },
];

const CropIcon = (s=18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6.13 1L6 16a2 2 0 0 0 2 2h15"/><path d="M1 6.13L16 6a2 2 0 0 1 2 2v15"/></svg>;
const WandIcon = (s=18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h2"/><line x1="3" y1="21" x2="21" y2="3"/></svg>;
const FilterIcon = (s=18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
const CheckIcon = (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const XIcon = (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const RotateIcon = (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>;
const BatchIcon = (s=18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="16" height="14" rx="2"/><path d="M6 3h16a2 2 0 0 1 2 2v16"/></svg>;

const tabStyle = (active) => ({
  flex: 1, background: "none", border: "none",
  borderBottom: active ? "2px solid "+T.accent : "2px solid transparent",
  padding: "12px 10px", color: active ? T.accent : T.textMuted,
  fontSize: 13, fontWeight: 600, cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
  fontFamily: T.font, transition: "all 0.2s",
});

function PhotoEditorModal({ file, tools, onSave, onCancel }) {
  const imgRef = useRef(null);
  const containerRef = useRef(null);
  const [tab, setTab] = useState(tools.crop ? "crop" : tools.enhance ? "enhance" : "filters");
  const [imgLoaded, setImgLoaded] = useState(false);
  const [cropActive, setCropActive] = useState(false);
  const [cropRatio, setCropRatio] = useState("free");
  const [cropRect, setCropRect] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const [enhance, setEnhance] = useState({ brightness: 100, contrast: 100, saturation: 100 });
  const [activeFilter, setActiveFilter] = useState("none");
  const [dims, setDims] = useState({ w: 400, h: 300 });

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      const maxW = Math.min(600, window.innerWidth - 48);
      const maxH = Math.min(500, window.innerHeight - 340);
      let w = img.width, h = img.height;
      if (w > maxW) { h = h*maxW/w; w = maxW; }
      if (h > maxH) { w = w*maxH/h; h = maxH; }
      w = Math.round(w); h = Math.round(h);
      setDims({ w, h });
      setCropRect({ x: 0, y: 0, w, h });
      setImgLoaded(true);
    };
    img.src = file.preview;
  }, [file.preview]);

  const initCropRect = useCallback(() => {
    const ratio = CROP_RATIOS.find(r => r.id === cropRatio)?.ratio;
    let cw = dims.w, ch = dims.h;
    if (ratio) {
      if (dims.w/dims.h > ratio) { cw = dims.h*ratio; } else { ch = dims.w/ratio; }
    }
    setCropRect({ x: (dims.w-cw)/2, y: (dims.h-ch)/2, w: cw, h: ch });
  }, [cropRatio, dims, imgLoaded]);

  useEffect(() => { if (cropActive) initCropRect(); }, [cropRatio, cropActive, initCropRect]);

  const getCSSFilter = () => {
    let f = "brightness("+enhance.brightness+"%) contrast("+enhance.contrast+"%) saturate("+enhance.saturation+"%) ";
    if (activeFilter !== "none") { const p = FILTERS.find(x => x.id === activeFilter); if (p) f += p.css+" "; }
    return f.trim() || "none";
  };

  const getMousePos = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: cx-rect.left, y: cy-rect.top };
  };

  const handleMouseDown = (e, type) => { e.preventDefault(); e.stopPropagation(); setDragging(type); setDragStart({ ...getMousePos(e), rect: { ...cropRect } }); };

  const handleMouseMove = useCallback((e) => {
    e.preventDefault();
    const pos = getMousePos(e);
    const dx = pos.x-dragStart.x, dy = pos.y-dragStart.y;
    const r = dragStart.rect;
    const ratio = CROP_RATIOS.find(cr => cr.id === cropRatio)?.ratio;
    if (dragging === "move") {
      setCropRect(prev => ({ ...prev, x: Math.max(0, Math.min(r.x+dx, dims.w-r.w)), y: Math.max(0, Math.min(r.y+dy, dims.h-r.h)) }));
    } else {
      let nx=r.x, ny=r.y, nw=r.w, nh=r.h;
      if (dragging.includes("e")) nw = Math.max(40, Math.min(r.w+dx, dims.w-r.x));
      if (dragging.includes("w")) { const d=Math.min(dx,r.w-40); nx=r.x+d; nw=r.w-d; if(nx<0){nw+=nx;nx=0;} }
      if (dragging.includes("s")) nh = Math.max(40, Math.min(r.h+dy, dims.h-r.y));
      if (dragging.includes("n")) { const d=Math.min(dy,r.h-40); ny=r.y+d; nh=r.h-d; if(ny<0){nh+=ny;ny=0;} }
      if (ratio) { nh=nw/ratio; if(ny+nh>dims.h){nh=dims.h-ny;nw=nh*ratio;} }
      setCropRect(prev => ({ ...prev, x:nx, y:ny, w:nw, h:nh }));
    }
  }, [dragging, dragStart, cropRect, cropRatio, dims]);

  const handleMouseUp = useCallback(() => { setDragging(null); setDragStart(null); }, []);

  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleMouseMove, {passive:false});
      window.addEventListener("touchend", handleMouseUp);
      return () => { window.removeEventListener("mousemove", handleMouseMove); window.removeEventListener("mouseup", handleMouseUp); window.removeEventListener("touchmove", handleMouseMove); window.removeEventListener("touchend", handleMouseUp); };
    }
  }, [dragging, handleMouseMove, handleMouseUp]);

  const applySave = () => {
    const canvas = document.createElement("canvas");
    const img = imgRef.current;
    let sx=0, sy=0, sw=img.width, sh=img.height;
    if (cropActive && cropRect) {
      const scX=img.width/dims.w, scY=img.height/dims.h;
      sx=cropRect.x*scX; sy=cropRect.y*scY; sw=cropRect.w*scX; sh=cropRect.h*scY;
    }
    canvas.width=sw; canvas.height=sh;
    const ctx = canvas.getContext("2d");
    ctx.filter = getCSSFilter();
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
    canvas.toBlob(blob => {
      if (blob) { onSave(new File([blob], file.name.replace(/\.[^.]+$/, "_ed.jpg"), { type: "image/jpeg", lastModified: Date.now() })); }
    }, "image/jpeg", 0.92);
  };

  const cs=12;
  const cornerS = (cur) => ({ position:"absolute", width:cs, height:cs, cursor:cur, zIndex:5 });

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", animation:"fadeIn 0.2s ease" }}>
      <div style={{ background:T.card, borderRadius:16, border:"1px solid "+T.border, width:Math.max(dims.w+48,420), maxWidth:"95vw", maxHeight:"95vh", overflow:"hidden", display:"flex", flexDirection:"column" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 20px", borderBottom:"1px solid "+T.border }}>
          <span style={{ fontSize:15, fontWeight:700, fontFamily:T.font, color:T.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"50%" }}>Retouche</span>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={onCancel} style={{ background:"rgba(255,255,255,0.06)", border:"none", borderRadius:8, padding:"7px 14px", color:T.textMuted, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:T.font, display:"flex", alignItems:"center", gap:5 }}>{XIcon(12)} Annuler</button>
            <button onClick={applySave} style={{ background:T.accent, border:"none", borderRadius:8, padding:"7px 16px", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:T.font, display:"flex", alignItems:"center", gap:5 }}>{CheckIcon(14)} Appliquer</button>
          </div>
        </div>
        <div style={{ display:"flex", borderBottom:"1px solid "+T.border, background:T.bg }}>
          {tools.crop && <button onClick={()=>setTab("crop")} style={tabStyle(tab==="crop")}>{CropIcon(15)} Recadrage</button>}
          {tools.enhance && <button onClick={()=>setTab("enhance")} style={tabStyle(tab==="enhance")}>{WandIcon(15)} Amélioration</button>}
          {tools.filters && <button onClick={()=>setTab("filters")} style={tabStyle(tab==="filters")}>{FilterIcon(15)} Filtres</button>}
        </div>
        <div style={{ display:"flex", justifyContent:"center", alignItems:"center", padding:20, background:"#080810", minHeight:250, position:"relative", overflow:"hidden" }}>
          {imgLoaded ? (
            <div ref={containerRef} style={{ position:"relative", width:dims.w, height:dims.h }}>
              <img src={file.preview} alt="" style={{ width:dims.w, height:dims.h, display:"block", filter:getCSSFilter() }} />
              {tab==="crop" && cropActive && cropRect && (<>
                
                <div onMouseDown={e=>handleMouseDown(e,"move")} onTouchStart={e=>handleMouseDown(e,"move")} style={{ position:"absolute", left:cropRect.x, top:cropRect.y, width:cropRect.w, height:cropRect.h, border:"2px solid "+T.accent, boxShadow:"0 0 0 9999px rgba(0,0,0,0.55)", cursor:"move", zIndex:2, background:"transparent" }}>
                  <div style={{ position:"absolute", left:"33.33%", top:0, bottom:0, width:1, background:"rgba(255,255,255,0.2)" }} />
                  <div style={{ position:"absolute", left:"66.66%", top:0, bottom:0, width:1, background:"rgba(255,255,255,0.2)" }} />
                  <div style={{ position:"absolute", top:"33.33%", left:0, right:0, height:1, background:"rgba(255,255,255,0.2)" }} />
                  <div style={{ position:"absolute", top:"66.66%", left:0, right:0, height:1, background:"rgba(255,255,255,0.2)" }} />
                </div>
                <div onMouseDown={e=>handleMouseDown(e,"nw")} onTouchStart={e=>handleMouseDown(e,"nw")} style={{ ...cornerS("nw-resize"), left:cropRect.x-4, top:cropRect.y-4, borderLeft:"3px solid "+T.accent, borderTop:"3px solid "+T.accent }} />
                <div onMouseDown={e=>handleMouseDown(e,"ne")} onTouchStart={e=>handleMouseDown(e,"ne")} style={{ ...cornerS("ne-resize"), left:cropRect.x+cropRect.w-cs+4, top:cropRect.y-4, borderRight:"3px solid "+T.accent, borderTop:"3px solid "+T.accent }} />
                <div onMouseDown={e=>handleMouseDown(e,"sw")} onTouchStart={e=>handleMouseDown(e,"sw")} style={{ ...cornerS("sw-resize"), left:cropRect.x-4, top:cropRect.y+cropRect.h-cs+4, borderLeft:"3px solid "+T.accent, borderBottom:"3px solid "+T.accent }} />
                <div onMouseDown={e=>handleMouseDown(e,"se")} onTouchStart={e=>handleMouseDown(e,"se")} style={{ ...cornerS("se-resize"), left:cropRect.x+cropRect.w-cs+4, top:cropRect.y+cropRect.h-cs+4, borderRight:"3px solid "+T.accent, borderBottom:"3px solid "+T.accent }} />
              </>)}
            </div>
          ) : <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
              <div style={{ width:32, height:32, borderRadius:"50%", border:"3px solid rgba(255,255,255,0.1)", borderTopColor:T.accent, animation:"spin 0.7s linear infinite" }} />
              <span style={{ color:T.textMuted, fontSize:12 }}>Chargement de la photo...</span>
            </div>}
        </div>
        <div style={{ padding:"14px 20px", borderTop:"1px solid "+T.border, background:T.card, maxHeight:220, overflowY:"auto" }}>
          {tab==="crop" && (<div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
              <button onClick={()=>{setCropActive(!cropActive);if(!cropActive)initCropRect();}} style={{ background:cropActive?T.accent:"rgba(255,255,255,0.06)", border:"none", borderRadius:8, padding:"8px 16px", color:cropActive?"#fff":T.textMuted, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:T.font }}>{cropActive?"Recadrage actif":"Activer le recadrage"}</button>
              {cropActive && <button onClick={initCropRect} style={{ background:"none", border:"none", color:T.textMuted, fontSize:12, cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>{RotateIcon(13)} Reset</button>}
            </div>
            {cropActive && <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>{CROP_RATIOS.map(r=>(
              <button key={r.id} onClick={()=>setCropRatio(r.id)} style={{ background:cropRatio===r.id?T.accentDim:"rgba(255,255,255,0.04)", border:"1px solid "+(cropRatio===r.id?T.accent:"rgba(255,255,255,0.08)"), borderRadius:8, padding:"6px 14px", color:cropRatio===r.id?T.accent:T.textMuted, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:T.font }}>{r.label}</button>
            ))}</div>}
          </div>)}
          {tab==="enhance" && (<div>
            <div style={{ display:"flex", gap:8, marginBottom:14 }}>
              <button onClick={()=>setEnhance({brightness:108,contrast:112,saturation:115})} style={{ background:T.accentDim, border:"1px solid "+T.accent, borderRadius:8, padding:"8px 16px", color:T.accent, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:T.font, display:"flex", alignItems:"center", gap:5 }}>{WandIcon(14)} Auto</button>
              <button onClick={()=>setEnhance({brightness:100,contrast:100,saturation:100})} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, padding:"8px 14px", color:T.textMuted, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:T.font }}>{RotateIcon(13)} Reset</button>
            </div>
            {[{key:"brightness",label:"Luminosité",min:50,max:150},{key:"contrast",label:"Contraste",min:50,max:150},{key:"saturation",label:"Saturation",min:0,max:200}].map(({key,label,min,max})=>(
              <div key={key} style={{ marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:T.textMuted, marginBottom:4 }}><span>{label}</span><span style={{ color:enhance[key]!==100?T.accent:T.textDim }}>{enhance[key]}%</span></div>
                <input type="range" min={min} max={max} value={enhance[key]} onChange={e=>setEnhance(prev=>({...prev,[key]:parseInt(e.target.value)}))} style={{ width:"100%", accentColor:T.accent, height:4 }} />
              </div>
            ))}
          </div>)}
          {tab==="filters" && (<div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:8 }}>{FILTERS.map(f=>(
            <button key={f.id} onClick={()=>setActiveFilter(f.id)} style={{ flexShrink:0, display:"flex", flexDirection:"column", alignItems:"center", gap:6, background:"none", border:"none", cursor:"pointer", padding:0 }}>
              <div style={{ width:64, height:64, borderRadius:10, overflow:"hidden", border:activeFilter===f.id?"2px solid "+T.accent:"2px solid rgba(255,255,255,0.06)", transition:"border 0.2s" }}>
                <img src={file.preview} alt={f.name} style={{ width:"100%", height:"100%", objectFit:"cover", filter:f.css }} />
              </div>
              <span style={{ fontSize:10, fontWeight:600, fontFamily:T.font, color:activeFilter===f.id?T.accent:T.textMuted }}>{f.name}</span>
            </button>
          ))}</div>)}
        </div>
      </div>
    </div>
  );
}

function BatchToolbar({ tools, files, onBatchApply }) {
  const [showBatch, setShowBatch] = useState(false);
  const [batchFilter, setBatchFilter] = useState("none");
  const [batchEnhance, setBatchEnhance] = useState(false);
  const pendingFiles = files.filter(f => f.status === "pending");
  if (pendingFiles.length < 2) return null;
  const doApply = () => { onBatchApply({ filter: batchFilter, enhance: batchEnhance }); setShowBatch(false); };
  const canApply = batchEnhance || batchFilter !== "none";
  return (
    <div style={{ marginBottom:14 }}>
      {!showBatch ? (
        <button onClick={()=>setShowBatch(true)} style={{ background:"rgba(232,89,60,0.08)", border:"1px solid rgba(232,89,60,0.2)", borderRadius:10, padding:"10px 18px", color:T.accent, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:T.font, display:"flex", alignItems:"center", gap:8, width:"100%", justifyContent:"center" }}>
          {BatchIcon(16)} Traitement par lot ({pendingFiles.length} photos)
        </button>
      ) : (
        <div style={{ background:T.card, border:"1px solid "+T.border, borderRadius:12, padding:18 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <span style={{ fontSize:14, fontWeight:700, color:T.text, fontFamily:T.font, display:"flex", alignItems:"center", gap:8 }}>{BatchIcon(16)} Traitement par lot</span>
            <button onClick={()=>setShowBatch(false)} style={{ background:"none", border:"none", color:T.textMuted, cursor:"pointer" }}>{XIcon(14)}</button>
          </div>
          <p style={{ fontSize:12, color:T.textMuted, marginBottom:14, lineHeight:1.5 }}>{"Appliquer \u00e0 toutes les "}<strong style={{ color:T.text }}>{pendingFiles.length}</strong>{" photos en attente."}</p>
          {tools.enhance && (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12, padding:"10px 14px", background:"rgba(255,255,255,0.03)", borderRadius:8 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>{WandIcon(15)}<span style={{ fontSize:13, color:T.text }}>{"Am\u00e9lioration auto"}</span></div>
              <button onClick={()=>setBatchEnhance(!batchEnhance)} style={{ background:batchEnhance?T.accent:"rgba(255,255,255,0.06)", border:"none", borderRadius:20, padding:"5px 14px", color:batchEnhance?"#fff":T.textMuted, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:T.font }}>{batchEnhance ? "\u2713 Activ\u00e9" : "D\u00e9sactiv\u00e9"}</button>
            </div>
          )}
          {tools.filters && (
            <div style={{ marginBottom:14 }}>
              <span style={{ fontSize:12, color:T.textMuted, marginBottom:8, display:"block" }}>Filtre :</span>
              <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:4 }}>{FILTERS.slice(0,8).map(f=>(
                <button key={f.id} onClick={()=>setBatchFilter(f.id)} style={{ flexShrink:0, padding:"6px 12px", borderRadius:8, background:batchFilter===f.id?T.accentDim:"rgba(255,255,255,0.04)", border:"1px solid "+(batchFilter===f.id?T.accent:"rgba(255,255,255,0.06)"), color:batchFilter===f.id?T.accent:T.textMuted, fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:T.font }}>{f.name}</button>
              ))}</div>
            </div>
          )}
          <button onClick={doApply} disabled={!canApply} style={{ width:"100%", background:canApply?T.accent:"rgba(255,255,255,0.04)", border:"none", borderRadius:10, padding:"11px 0", color:canApply?"#fff":T.textMuted, fontSize:14, fontWeight:700, cursor:canApply?"pointer":"default", fontFamily:T.font }}>{"Appliquer \u00e0 " + pendingFiles.length + " photos"}</button>
        </div>
      )}
    </div>
  );
}

export { PhotoEditorModal, BatchToolbar, FILTERS };
