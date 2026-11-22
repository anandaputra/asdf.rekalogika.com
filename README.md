# asdf.rekalogika.com

Blog yang dibuat dengan [Docusaurus](https://docusaurus.io/) (mode blog saja).

## Menjalankan di lokal

```bash
npm ci          # pasang dependensi (pertama kali / setelah package-lock.json berubah)
npm start       # server development di http://localhost:3000, auto-reload
npm run build   # build produksi ke folder build/ (gagal jika ada link rusak)
npm run serve   # preview hasil build di http://localhost:3000
```

Hentikan `npm start` sebelum menjalankan `npm install`/`npm ci`.

## Menulis artikel

1. Buat folder `blog/YYYY-MM-DD-slug/` berisi `index.md` (gambar disimpan di folder yang sama).
2. Isi frontmatter:

   ```markdown
   ---
   slug: judul-artikel
   title: Judul Artikel
   authors: [ananda]
   tags: [umum]
   description: Ringkasan singkat untuk SEO dan preview media sosial.
   ---

   Paragraf pembuka yang tampil di daftar artikel.

   {/* truncate */}

   Isi lengkap artikel...
   ```

3. Penulis didaftarkan di `blog/authors.yml`, tag di `blog/tags.yml`.
4. Tambahkan `draft: true` di frontmatter untuk draf (tampil di `npm start`, tidak ikut build produksi).
5. File `.md` diproses sebagai MDX: gunakan `{/* komentar */}`, bukan `<!-- -->`.

## Tampilan

- Warna: `src/css/custom.css` (generator palet: https://docusaurus.io/docs/styling-layout)
- Navbar, footer, mode terang/gelap, tema blok kode: `themeConfig` di `docusaurus.config.ts`
- Logo & favicon: `static/img/logo.svg`

## Alur kerja

Branch `main` adalah versi yang tayang. Tulis di branch terpisah bila perlu, jalankan
`npm run build` sebelum push, lalu merge ke `main`.
