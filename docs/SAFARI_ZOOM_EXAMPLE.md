# Contoh: Safari Zoom Settings untuk PWA

## Scenario: User Buka Melalui Safari dan Set Zoom 75%

### Langkah 1: User Buka dalam Safari
```
1. User buka Safari di iPhone/iPad
2. Navigate ke https://your-app-url.com
3. App dibuka dalam Safari browser
```

### Langkah 2: User Set Zoom ke 75%
```
1. User pinch zoom untuk zoom out ke 75%
2. Atau double-tap untuk zoom out
3. Setting zoom ini akan disimpan oleh Safari
```

### Langkah 3: Add to Home Screen
```
1. Tap Share button (kotak dengan anak panah)
2. Pilih "Add to Home Screen"
3. Tap "Add"
4. Icon app akan muncul di home screen
```

### Langkah 4: Buka dari Home Screen
```
1. Tap icon app dari home screen
2. App akan buka dalam standalone mode (PWA)
3. Zoom setting 75% akan dikekalkan
```

## Konfigurasi yang Diperlukan

### 1. Viewport Configuration (app/layout.tsx)
```typescript
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,      // Benarkan zoom sehingga 500%
  minimumScale: 0.5,    // Benarkan zoom down ke 50% (75% termasuk)
  userScalable: true,   // Enable user zoom/pinch
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#020817" }
  ],
  viewportFit: "cover"
};
```

### 2. Manifest Configuration (public/manifest.json)
```json
{
  "name": "VM Route Manager",
  "short_name": "VM Route",
  "description": "Vending Machine Route Management",
  "start_url": "/",
  "display": "standalone",
  "orientation": "any",
  "background_color": "#ffffff",
  "theme_color": "#fafbfc"
}
```

## Cara Ia Berfungsi

### Safari Behavior:
1. **Browser Mode**: Safari menyimpan zoom level untuk setiap website
2. **Zoom Settings**: Bila user zoom in/out, Safari ingat setting tersebut
3. **PWA Installation**: Bila add to home screen, Safari akan:
   - Simpan current zoom level (contoh: 75%)
   - Simpan viewport state
   - Simpan scroll position (optional)

### PWA Standalone Mode:
1. **Initial Load**: PWA akan load dengan zoom level yang terakhir
2. **Persistence**: Zoom setting akan persist across sessions
3. **User Control**: User masih boleh adjust zoom bila perlu

## Testing Steps

### Test 1: Zoom Persistence
```
1. Buka app di Safari
2. Zoom out ke 75% (pinch gesture)
3. Refresh page → Zoom tetap 75%
4. Add to home screen
5. Buka dari home screen → Zoom masih 75%
```

### Test 2: Dynamic Zoom
```
1. Buka PWA dari home screen
2. Pinch zoom ke 50%
3. Close app
4. Buka semula → Zoom tetap 50%
```

### Test 3: Different Pages
```
1. Set zoom 75% di dashboard
2. Navigate ke route-vm page
3. Zoom masih 75% (global setting)
```

## iOS Safari Specific Features

### Apple Meta Tags (Optional Enhancement)
Tambah dalam `<head>` untuk better iOS support:

```html
<!-- iOS Standalone Mode -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="VM Route">

<!-- iOS Smart App Banner (Optional) -->
<meta name="apple-itunes-app" content="app-id=myAppStoreID">
```

## Important Notes

### ⚠️ Safari Limitations:
1. Zoom settings mungkin reset bila:
   - Clear Safari cache
   - Update iOS version
   - Clear website data

2. Best Practices:
   - Set `minimumScale: 0.5` untuk allow zoom out
   - Set `maximumScale: 5` untuk allow zoom in
   - Enable `userScalable: true` untuk pinch zoom

### ✅ Advantages:
- User ada control penuh atas display size
- Accessibility friendly untuk users dengan vision issues
- Natural iOS behavior yang users biasa

### 📱 Compatibility:
- iOS Safari: ✅ Full support
- Safari on iPadOS: ✅ Full support
- Chrome on iOS: ⚠️ Limited (uses Safari engine)
- Other browsers: 🔄 Varies by browser

## Code Implementation

### Current Implementation:
File telah dikemaskini:
- ✅ `app/layout.tsx` - Viewport configuration
- ✅ `public/manifest.json` - PWA manifest

### Testing:
```bash
# Build production version
npm run build

# Test locally
npm run start

# atau deploy ke Vercel untuk test real device
vercel --prod
```

## Troubleshooting

### Issue: Zoom tidak persist
**Solution**: 
- Pastikan `userScalable: true`
- Check `maximumScale` dan `minimumScale` values
- Clear Safari cache dan test semula

### Issue: App selalu reset ke 100%
**Solution**:
- Remove fixed viewport width
- Pastikan tidak ada CSS yang force zoom level
- Check untuk `touch-action: manipulation` yang might interfere

### Issue: Zoom berbeza di landscape vs portrait
**Solution**:
- Set `orientation: "any"` dalam manifest
- Test both orientations
- Consider responsive breakpoints

## Example CSS untuk Better Zoom Experience

```css
/* Ensure content scales properly */
html, body {
  width: 100%;
  height: 100%;
  overflow-x: hidden;
}

/* Prevent text size adjustment */
body {
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}

/* Smooth zooming */
* {
  -webkit-tap-highlight-color: transparent;
}
```

## Kesimpulan

Dengan konfigurasi ini:
1. ✅ User boleh set zoom di Safari (contoh: 75%)
2. ✅ Setting zoom akan persist bila add to home screen
3. ✅ PWA akan remember user preference
4. ✅ User masih boleh adjust zoom bila perlu
5. ✅ Accessibility-friendly dan user-friendly
