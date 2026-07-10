#!/usr/bin/env python3
"""Build the master key->function mapping (CSV + JSON) from layouts/ + functions/.

Reads:  hp/layouts/<MODEL>.md   (physical key grids)
        hp/functions/<MODEL>.md  (function catalogues -> descriptions)
Writes: hp/mapping/mapping.csv, hp/mapping/mapping.json
Run from the hp/ directory:  python3 mapping/build_mapping.py
"""
import re, os, json, csv

LAY, FUN, OUT = "layouts", "functions", "mapping"
MODELS = ["HP-35","HP-45","HP-65","HP-25","HP-67","HP-97","HP-41C-CV","HP-41CX",
          "HP-11C","HP-12C","HP-15C","HP-16C","HP-28C","HP-28S","HP-42S",
          "HP-48SX","HP-48G","HP-49G","HP-50g","HP-35s","HP-Prime"]
read = lambda p: open(p, encoding="utf-8", errors="replace").read()

# ---------- name canonicalization for the description join ----------
SUP = str.maketrans({'⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7',
                     '⁸':'8','⁹':'9','⁻':'-','ⁿ':'n','ˣ':'x','ⁱ':'i',
                     '₀':'0','₁':'1','₂':'2','₃':'3','₄':'4','₅':'5','₆':'6','₇':'7',
                     '₈':'8','₉':'9','ⱼ':'j'})
ALIAS = {'√':'sqrt','π':'pi','σ':'sigma','×':'*','÷':'/','−':'-','–':'-',
         '≤':'<=','≥':'>=','≠':'!=','≷':'<>','⇄':'<>','⇅':'<>','↓':'down','↑':'up',
         '∫':'integral','δ':'delta','→':'to','∆':'delta','×':'*'}
def canon(s):
    if not s: return ''
    s = s.translate(SUP).lower()
    for k,v in ALIAS.items(): s = s.replace(k,v)
    return re.sub(r'\s+','',s)
def loose(s):  # alnum-only fallback key
    return re.sub(r'[^a-z0-9]','', canon(s))

# auto-descriptions for structural keys that never appear in the function catalogues
def auto_desc(name):
    n = name.strip()
    if re.fullmatch(r'[0-9]', n): return f"digit {n}"
    if n in ('.', '·', ','): return "decimal point"
    if n in ('f','g','h'): return f"{n} shift prefix"
    if n.lower() in ('on','off'): return "power on/off"
    return ''

# ---------- markdown table parsing ----------
def parse_tables(md):
    tables=[]; lines=md.splitlines(); i=0
    while i<len(lines):
        if lines[i].strip().startswith('|') and i+1<len(lines) and re.match(r'^\|[\s:|-]+\|?\s*$',lines[i+1]):
            hdr=[c.strip() for c in lines[i].strip().strip('|').split('|')]
            rows=[]; j=i+2
            while j<len(lines) and lines[j].strip().startswith('|'):
                rows.append([c.strip() for c in lines[j].strip().strip('|').split('|')]); j+=1
            tables.append((hdr,rows,i)); i=j
        else: i+=1
    return tables

def classify_col(h):
    hl=h.lower(); m=re.search(r'\(([^)]+)\)',h); color=m.group(1).strip() if m else None
    if 'alpha' in hl: return('alpha',color)
    if 'left-shift' in hl: return('left',color)
    if 'right-shift' in hl: return('right',color)
    if 'f-shift' in hl or 'gold-shift' in hl: return('f',color or 'gold')
    if 'g-shift' in hl: return('g',color or 'blue')
    if 'h-shift' in hl: return('h',color or 'black')
    if hl.startswith('shift') or hl=='shift': return('shift',color)
    if 'shifted' in hl: return('shift',color or ('gold' if 'gold' in hl else None))
    return(None,None)
def is_empty(v): return v is None or v.strip() in ('','—','-','–','[?]','(gold shift)')
def split_multi(cell): return [x.strip() for x in cell.split('·')] if ' · ' in cell else [cell.strip()]

def clean_shift(val, primary):
    """Normalize the compact notations used by the early models (HP-45/65):
    strip a leading '(gold above)'/'gold:' annotation and a '<primary>→' prefix so the
    stored value is the shifted FUNCTION itself, not 'primary→function'."""
    v = val.strip()
    v = re.sub(r'^\((?:gold above|blue below|gold|blue)\)\s*', '', v)
    v = re.sub(r'^(?:gold|blue)\s*:\s*', '', v)
    if primary:
        for arrow in ('→', '->'):
            if v.startswith(primary + arrow):
                v = v[len(primary) + len(arrow):].strip(); break
    return v
def is_compound_shift(val):
    """HP-65 packs both gold and blue functions into one cell ('gold: … ; blue: …');
    these can't be positionally aligned, so flag them rather than emit wrong mappings."""
    return bool(re.search(r'\b(gold|blue)\s*:', val)) and ';' in val
def keypad_for(md,tl):
    kp=None
    for l in reversed(md.splitlines()[:tl]):
        m=re.match(r'^###\s+(.*)',l)
        if m: kp=m.group(1).strip(); break
        if l.startswith('## '): break
    return kp
def src_line(md):
    m=re.search(r'^\-\s*\*\*Source:\*\*\s*(.+?)(?:\s+—\s+hp/manuals/.*)?$',md,re.M)
    return m.group(1).strip() if m else ''

# ---------- page reference splitting (printed vs PDF) ----------
# Require an explicit page marker: 'page'/'pages'/'pp'/'pp.'/'p.' — NOT a bare 'p'
# (a bare 'p' would match the P in 'HP 48G' and capture the model name as a page).
PAGE_RE = re.compile(r'(PDF\s+|rendered\s+page\s+|printed\s+)?'
                     r'(?:pages?|pp\.?|p\.)\s*'
                     r'(p?[0-9]{1,3}[A-Za-z]?(?:\s*[–-]\s*[0-9]{1,3})?)', re.I)
def split_pages(src):
    printed=[]; pdf=[]
    for m in PAGE_RE.finditer(src):
        qual=(m.group(1) or '').lower(); tok=re.sub(r'\s*[–-]\s*','–',m.group(2).strip())
        (pdf if ('pdf' in qual or 'rendered' in qual) else printed).append(tok)
    dedup=lambda L: "; ".join(dict.fromkeys(L))
    return dedup(printed), dedup(pdf)

# ---------- function-catalogue description lookup ----------
def fun_lookup(model):
    p=os.path.join(FUN,model+".md")
    if not os.path.exists(p): return {},{},''
    md=read(p); exact={}; lo={}
    for hdr,rows,_ in parse_tables(md):
        hl=[h.lower() for h in hdr]
        fi=next((k for k,h in enumerate(hl) if 'function' in h or 'command' in h),0)
        di=next((k for k,h in enumerate(hl) if 'description' in h),len(hdr)-1)
        for cells in rows:
            if len(cells)<=max(fi,di): continue
            name=cells[fi]; desc=cells[di].strip()
            if name and name.lower() not in ('function','command','function/command') and desc:
                exact.setdefault(canon(name),desc)
                lk=loose(name)
                if lk: lo.setdefault(lk,set()).add(desc)
    return exact, lo, src_line(md)
def desc_for(name, exact, lo):
    d=exact.get(canon(name))
    if d: return d, 'exact'
    lk=loose(name)
    if lk and lk in lo and len(lo[lk])==1: return next(iter(lo[lk])), 'loose'
    a=auto_desc(name)
    if a: return a, 'auto'
    return '', ''

# ---------- build ----------
records=[]; per_model={}; stats={}
for model in MODELS:
    lp=os.path.join(LAY,model+".md")
    if not os.path.exists(lp): continue
    md=read(lp); lsrc=src_line(md); pdf=f"hp/manuals/{model}.pdf"
    exact,lo,fsrc=fun_lookup(model)
    kb_pr,kb_pdf=split_pages(lsrc); fn_pr,fn_pdf=split_pages(fsrc)
    per_model[model]={"keyboard_source":lsrc,"function_source":fsrc,"manual_pdf":pdf,
                      "keyboard_printed_page":kb_pr,"keyboard_pdf_page":kb_pdf,
                      "function_printed_pages":fn_pr,"function_pdf_pages":fn_pdf,"keys":[]}
    mcount={'exact':0,'loose':0,'auto':0,'none':0}
    for hdr,rows,tline in parse_tables(md):
        hl=[h.lower() for h in hdr]
        pi=next((k for k,h in enumerate(hl) if h.startswith('primary')),None)
        if pi is None: continue
        shiftcols=[(k,)+classify_col(h) for k,h in enumerate(hdr) if k!=pi and classify_col(h)[0]]
        ni=next((k for k,h in enumerate(hl) if h=='notes'),None)
        ri=next((k for k,h in enumerate(hl) if h=='row'),None)
        keypad=keypad_for(md,tline)
        for cells in rows:
            if len(cells)<=pi: continue
            prim_cell=cells[pi]
            if not prim_cell or prim_cell.lower()=='primary': continue
            rownum=cells[ri].strip() if (ri is not None and len(cells)>ri) else ''
            primaries=split_multi(prim_cell)
            colsplit={k:(split_multi(cells[k]) if (len(cells)>k and len(primaries)>1) else [cells[k] if len(cells)>k else '']) for k,_,_ in shiftcols}
            for idx,primary in enumerate(primaries):
                if not primary.strip(): continue
                keyobj={"row":rownum,"keypad":keypad,"primary":primary,"presses":[]}
                if not is_empty(primary):
                    d,how=desc_for(primary,exact,lo); mcount[how or 'none']+=1
                    keyobj["presses"].append({"access":"none","prefix":"","function":primary,"description":d})
                    records.append([model,keypad or '',rownum,primary,'none','',primary,d,kb_pr,kb_pdf,fn_pr,fn_pdf,pdf])
                for k,acc,col in shiftcols:
                    vlist=colsplit[k]; val=vlist[idx].strip() if idx<len(vlist) else ''
                    if is_empty(val) or is_compound_shift(val): continue
                    val=clean_shift(val, primary)
                    if is_empty(val): continue
                    d,how=desc_for(val,exact,lo); mcount[how or 'none']+=1
                    pl={'f':'f','g':'g','h':'h','left':'left-shift','right':'right-shift','alpha':'ALPHA','shift':'shift'}.get(acc,acc)
                    keyobj["presses"].append({"access":acc,"prefix":pl,"color":col or '',"function":val,"description":d})
                    records.append([model,keypad or '',rownum,primary,acc,col or '',val,d,kb_pr,kb_pdf,fn_pr,fn_pdf,pdf])
                if keyobj["presses"]: per_model[model]["keys"].append(keyobj)
    stats[model]=mcount

os.makedirs(OUT,exist_ok=True)
with open(os.path.join(OUT,"mapping.csv"),"w",newline='',encoding="utf-8") as f:
    w=csv.writer(f)
    w.writerow(["model","keypad","row","physical_key","access","prefix_color","function",
                "description","keyboard_printed_page","keyboard_pdf_page",
                "function_printed_pages","function_pdf_pages","manual_pdf"])
    w.writerows(records)
json.dump(per_model,open(os.path.join(OUT,"mapping.json"),"w",encoding="utf-8"),ensure_ascii=False,indent=1)

tot=len(records)
mm={k:sum(s[k] for s in stats.values()) for k in ('exact','loose','auto','none')}
withdesc=mm['exact']+mm['loose']+mm['auto']
print(f"records: {tot}")
print(f"  described: {withdesc} ({100*withdesc//tot}%)  = exact {mm['exact']} + loose {mm['loose']} + auto {mm['auto']}")
print(f"  blank:     {mm['none']} ({100*mm['none']//tot}%)")
if __name__=="__main__" and os.environ.get("VERBOSE"):
    for m in MODELS:
        s=stats.get(m,{}); n=s.get('none',0); t=sum(s.values())
        print(f"  {m:12} {t:4} mappings, blank {n}")
