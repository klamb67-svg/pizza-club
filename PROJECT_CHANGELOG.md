# Pizza Club Project Changelog

## December 23, 2025 - QR Redirect Update

### Change: QR Code Redirect Updated to Browser Version

**Date**: December 23, 2025  
**Type**: Configuration Update

#### What Changed
- Updated QR code redirect from Google Play Store to browser version
- QR codes on Pizza Club black cards now point to web app instead of Play Store download

#### Files Modified
- `pizzadojo2go/hidden/pizzaclub/index.html`

#### Technical Details
- **Old redirect**: `https://play.google.com/apps/internaltest/4701610912534431252`
- **New redirect**: `https://pizzaclub.pizzadojo2go.com/`
- Added cache-busting headers to prevent browser/CDN caching
- Added JavaScript redirect fallback: `window.location.replace()`
- Added manual link for users if redirects fail

#### Git Commits
- **Submodule commit**: `9689c04` - "Update QR redirect to browser version with cache-busting"
- **Main repo commit**: `7b62fb2` - "Update pizzadojo2go submodule"

#### Impact
- Users scanning QR codes can now access the app immediately via web browser
- No need to download from Play Store for quick access
- Better user experience for immediate access

#### Status
✅ Deployed and verified working

---

## December 23, 2025 - Emergency Security Fix

### Change: API Key Rotation & Security Update

**Date**: December 23, 2025  
**Type**: Security Fix (Critical)

#### What Changed
- Rotated all Supabase API keys (service_role and anon/publishable)
- Replaced legacy JWT keys with modern API keys
- Updated all source files and environment variables
- Rebuilt and redeployed mobile and web apps

#### Files Modified
- 12 source TypeScript files
- `.env` file
- Build artifacts regenerated

#### Status
✅ Complete - All systems secured and operational

---

*See SESSION_SUMMARY_DEC_23_2025_SECURITY_FIX.md for detailed information*

