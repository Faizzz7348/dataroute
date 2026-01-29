#!/bin/bash

echo "🧹 Membersihkan cache aplikasi..."

# Hapus .next folder (Next.js build cache)
if [ -d ".next" ]; then
  echo "Menghapus .next folder..."
  rm -rf .next
  echo "✅ .next folder terhapus"
else
  echo "ℹ️  .next folder tidak ada"
fi

# Hapus service worker lama
if [ -f "public/sw.js" ]; then
  echo "Menghapus service worker lama..."
  rm -f public/sw.js
  echo "✅ Service worker terhapus"
fi

if [ -f "public/workbox-87b8d583.js" ]; then
  echo "Menghapus workbox lama..."
  rm -f public/workbox-*.js
  echo "✅ Workbox files terhapus"
fi

# Hapus node_modules cache (opsional)
echo ""
echo "📦 Untuk membersihkan cache node_modules, jalankan:"
echo "   rm -rf node_modules && npm install"

echo ""
echo "✅ Cache telah dibersihkan!"
echo "🔄 Jalankan 'npm run build' untuk generate ulang cache yang bersih"
