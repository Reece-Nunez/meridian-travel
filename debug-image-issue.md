# Debug: Images Saving to Database Before Form Submission

## The Problem
Images are being saved to the database immediately when uploaded, even before clicking "Save Changes".

## Possible Causes

### 1. Auto-Save Feature (Most Likely)
There might be a hidden auto-save feature similar to the CMS content page.

### 2. Form Submission Trigger
Something might be triggering form submission on image upload.

### 3. Direct Database Updates
The image upload might be directly updating the database.

## Debug Steps

### Step 1: Check Network Tab
1. Open browser DevTools (F12) 
2. Go to Network tab
3. Upload an image
4. Look for any PUT/POST requests to `/api/` or Supabase

### Step 2: Check Page URL
- Are you on `/admin/packages/new` (new package)
- Or on `/admin/packages/[id]/edit` (editing existing package)?

### Step 3: Console Logging
If on edit page, check console for any automatic save logs.

## Expected Behavior
Images should only save to database when you click "Save Changes" or "Create Package".

## Suspected Issue
The edit page might have inherited auto-save functionality from the CMS.