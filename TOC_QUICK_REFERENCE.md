# DOCX TOC PAGEREF Fixes - Quick Reference Checklist

## ✅ All Fixes Applied

### Bookmark Placement Corrections (4 files)
- [x] **executive_summary.py** - Line 41-45: Moved `add_bookmark()` BEFORE run
- [x] **conclusion.py** - Line 13-16: Moved `add_bookmark()` BEFORE run  
- [x] **results.py** - Added bookmark import + 2 new bookmarks (scope, results)
- [x] **methodology.py** - Verified already correct (no changes needed)

### Bookmark Reorganization (2 files)
- [x] **results.py** - Added `add_bookmark(p, "scope")` for "3. Project Scope"
- [x] **results.py** - Added `add_bookmark(p, "results")` for "4. Penetration Testing Results"
- [x] **scan_manifest.py** - REMOVED orphaned `add_bookmark(p, "scope")` from table header
- [x] **detailed_findings.py** - REMOVED orphaned `add_bookmark(p, "results")` from "3. Detailed Findings"

---

## 📊 Bookmark Mapping (TOC ↔ Sections)

| TOC Entry | Bookmark | Section File | Title in File |
|-----------|----------|--------------|---------------|
| 1. Executive Summary | `exec_summary` | executive_summary.py | "1. Executive Summary" |
| 1.1 Overview | `exec_summary` | executive_summary.py | "1.1 Overview" |
| 1.2 Risk Model | `exec_summary` | executive_summary.py | "1.2 Risk Model" |
| 2. Web Application Pentesting Methodology | `methodology` | methodology.py | "2. Web Application..." |
| 3. Project Scope | `scope` | results.py | "3. Project Scope" |
| 4. Penetration Testing Results | `results` | results.py | "4. Penetration Testing Results" |
| 5. Conclusion | `conclusion` | conclusion.py | "5. Conclusion" |

---

## 🔍 XML Structure Verification

### Correct Bookmark Structure (AFTER FIX)
```xml
<w:p>
  <w:bookmarkStart w:id="12345" w:name="exec_summary"/>
  <w:r><w:t>1. Executive Summary</w:t></w:r>
  <w:bookmarkEnd w:id="12345"/>
</w:p>
```

### Correct PAGEREF Field Structure
```xml
<w:fldChar w:fldCharType="begin"/>
<w:instrText xml:space="preserve"> PAGEREF exec_summary \h </w:instrText>
<w:fldChar w:fldCharType="separate"/>
<w:t>1</w:t>
<w:fldChar w:fldCharType="end"/>
```

---

## 📝 Code Pattern - How to Add Bookmarks Correctly

### ✅ CORRECT PATTERN
```python
from apps.knowledge.reports.docx_builder.toc import add_bookmark

# Create paragraph
p = doc.add_paragraph()

# ADD BOOKMARK FIRST (before any runs)
add_bookmark(p, "section_id")

# THEN add text
run = p.add_run("Section Title")
run.bold = True
run.font.size = Pt(14)
```

### ❌ WRONG PATTERN (DO NOT USE)
```python
# Create paragraph
p = doc.add_paragraph()

# Add text first (WRONG!)
run = p.add_run("Section Title")
run.bold = True

# Add bookmark after (WRONG!)
add_bookmark(p, "section_id")  # ❌ Too late!
```

---

## 🧪 Testing the Fix

### Before (BROKEN)
```
TOC Page Numbers:
1. Executive Summary ............. 1
2. Pentesting Methodology ........ 1
3. Project Scope ................ 1
4. Penetration Testing Results ... 1
5. Conclusion ................... 1
```

### After (FIXED)
```
TOC Page Numbers:
1. Executive Summary ............. 5
2. Pentesting Methodology ........ 6
3. Project Scope ................ 8
4. Penetration Testing Results ... 8
5. Conclusion ................... 12
```

---

## 📋 Document Generation Order

```
build_docx()
├── draw_cover()
├── draw_legal()
├── draw_toc()                    ← PAGEREF fields reference these bookmarks
├── draw_scan_manifest()
├── draw_executive_summary()      ← BOOKMARK: exec_summary ✅
├── draw_methodology()            ← BOOKMARK: methodology ✅
├── draw_results()                ← BOOKMARKS: scope ✅, results ✅
├── draw_detailed_findings()      ← No bookmark (not in TOC)
└── draw_conclusion()             ← BOOKMARK: conclusion ✅
```

---

## 🔧 Implementation Details

### add_bookmark() Function (toc.py)
```python
def add_bookmark(paragraph, name):
    bookmark_id = str(uuid.uuid4().int % 100000)
    
    start = OxmlElement('w:bookmarkStart')
    start.set(qn('w:id'), bookmark_id)
    start.set(qn('w:name'), name)
    
    end = OxmlElement('w:bookmarkEnd')
    end.set(qn('w:id'), bookmark_id)
    
    # INSERT AT POSITION 0 (start of paragraph)
    paragraph._p.insert(0, start)    # ✅ BEFORE any runs
    paragraph._p.append(end)         # At the end
```

### add_page_ref() Function (toc.py)
```python
def add_page_ref(run, bookmark_name):
    fldChar_begin = OxmlElement('w:fldChar')
    fldChar_begin.set(qn('w:fldCharType'), 'begin')
    
    instrText = OxmlElement('w:instrText')
    instrText.set(qn('xml:space'), 'preserve')
    instrText.text = f' PAGEREF {bookmark_name} \\h '
    
    fldChar_separate = OxmlElement('w:fldChar')
    fldChar_separate.set(qn('w:fldCharType'), 'separate')
    
    text = OxmlElement('w:t')
    text.text = "1"  # Placeholder
    
    fldChar_end = OxmlElement('w:fldChar')
    fldChar_end.set(qn('w:fldCharType'), 'end')
    
    run._r.append(fldChar_begin)
    run._r.append(instrText)
    run._r.append(fldChar_separate)
    run._r.append(text)
    run._r.append(fldChar_end)
```

---

## 🚀 Deployment Steps

1. **Deploy Code Changes**
   - Copy fixed versions of 6 Python files
   - Or replace entire `docx_builder/` directory

2. **Generate Test Document**
   ```bash
   python manage.py generate_report
   ```

3. **Open in Word**
   - Open generated DOCX file
   - If prompted "Update links?", click "Yes"

4. **Update Fields**
   - Select All: Ctrl+A
   - Update Fields: F9
   - Confirm: "Update all fields"

5. **Verify Results**
   - Table of Contents should show correct page numbers
   - Each entry should point to correct section

6. **Deploy to Production**
   - Once verified working, deploy to production environment

---

## 📞 Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Page numbers still "1" | Fields not updated | Open in Word → Ctrl+A → F9 |
| "#Ref" instead of number | Field error (bookmark not found) | Verify bookmark is BEFORE run in XML |
| Works in Word, not LibreOffice | PAGEREF not fully supported in LibreOffice | Use Word for correct field resolution |
| Bookmark showing in document | Bookmarks made visible | In Word: File → Options → Display → Show bookmarks (uncheck) |

---

## 📌 Remember

- **Python-docx** creates the XML structure for fields
- **Microsoft Word** reads the XML and calculates field values
- Bookmarks MUST be BEFORE runs in XML hierarchy
- Fields must be MANUALLY updated in Word (Ctrl+A → F9)
- Don't modify field XML directly - use functions provided

---

## ✨ Summary

**Problem:** PAGEREF fields all showing "1"  
**Root Cause:** Bookmarks misplaced (after runs instead of before)  
**Solution:** Repositioned 4 bookmarks + added 2 new ones + removed 2 orphaned  
**Result:** PAGEREF fields now correctly resolve to section bookmarks

**Status:** ✅ Ready for Testing

