# asdf.rekalogika.com

Blog yang dibuat dengan [Docusaurus](https://docusaurus.io/) (mode blog saja), tayang di
https://asdf.rekalogika.com/.

## Menjalankan di lokal

```bash
npm ci          # pasang dependensi (pertama kali / setelah package-lock.json berubah)
npm start       # server development di http://localhost:3000, auto-reload
npm run build   # build produksi ke folder build/ (gagal jika ada link rusak)
npm run serve   # preview hasil build di http://localhost:3000
```

- Hentikan `npm start` (Ctrl+C) sebelum menjalankan `npm ci`, `npm install`, atau
  `npm run build`, karena semuanya memakai folder `.docusaurus` yang sama.
- Jika `npm start` menampilkan error aneh padahal file artikel benar, restart dulu.
  Jika masih error, jalankan `npm run clear` lalu `npm start`.

## Menulis artikel

1. Buat folder `blog/YYYY-MM-DD-slug/` berisi `index.md` (gambar disimpan di folder yang sama).
2. Isi frontmatter:

   ```markdown
   ---
   slug: judul-artikel
   title: Judul Artikel
   date: 2026-11-22T20:00:00+07:00
   authors: [ananda]
   tags: [umum]
   description: Ringkasan singkat untuk SEO dan preview media sosial.
   draft: true
   ---

   Paragraf pembuka yang tampil di daftar artikel.

   {/* truncate */}

   Isi lengkap artikel...
   ```

3. `date` dengan jam dan zona waktu (`+07:00` = WIB) menentukan urutan artikel yang terbit
   di hari yang sama. Tanpa jam, artikel di hari yang sama diurutkan berdasarkan abjad.
4. `draft: true` membuat artikel tampil di `npm start` tetapi tidak ikut build produksi.
   **Hapus sebelum merge**. Jika lupa, deploy tetap hijau tetapi artikel tidak tayang.
5. Penulis didaftarkan di `blog/authors.yml`, tag di `blog/tags.yml`.
6. File `.md` diproses sebagai MDX: gunakan `{/* komentar */}`, bukan `<!-- -->`.

Untuk menghapus artikel, hapus foldernya (`git rm -r blog/YYYY-MM-DD-slug/`). Deploy
berikutnya juga menghapusnya dari server.

## Alur kerja

Branch `main` adalah versi yang tayang. Setiap perubahan dikerjakan di branch sendiri:

```bash
git switch main && git pull
git switch -c post/judul-artikel
# tulis / edit, preview dengan npm start, hapus draft: true
npm run build
git add blog/… && git commit -m "Post: Judul Artikel"
git push -u origin post/judul-artikel
gh pr create --fill && gh pr checks --watch   # PR hanya menjalankan build
gh pr merge --squash --delete-branch          # merge ke main → deploy otomatis
git switch main && git pull
```

## Deploy

Situs dideploy otomatis oleh GitHub Actions
([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)) ke shared hosting
(panel Elpan, Apache).

```
push ke main ──► job build ──────────────────► job deploy ─────────────────────► server
                 npm ci, typecheck, build      rsync --delete build/ via SSH     document root
                 (artifact "site")             lalu smoke test (HTTP 200)        asdf.rekalogika.com
```

| Pemicu | Yang dijalankan |
|---|---|
| Push ke `main` | build + deploy |
| Pull request ke `main` | build saja (cek sebelum merge) |
| Manual (tab **Actions → Build & deploy → Run workflow**) | build + deploy |

### Kunci deploy

GitHub Actions memakai kunci SSH khusus (komentar `github-actions-asdf`), bukan kunci pribadi.
Di server, kunci ini dipasang lewat panel (**Password & Security → SSH Keys**) dengan pembatasan:

```
command="/usr/bin/rrsync -wo /home/<user>/home/public/asdf.rekalogika.com",restrict ssh-ed25519 AAAA… github-actions-asdf
```

Artinya kunci ini hanya bisa dipakai rsync untuk **menulis** ke document root blog. Kunci ini
tidak bisa membuka shell, membaca file, atau menyentuh situs lain di akun hosting. Karena
`rrsync` sudah mengunci folder tujuan, workflow menulis tujuan rsync tanpa path
(`user@host:`).

`authorized_keys` dikelola oleh panel, jadi tambah atau hapus kunci selalu lewat panel, bukan
dengan mengedit file tersebut.

### Secret GitHub

Disimpan di **Settings → Secrets and variables → Actions**. Host, port, dan user sengaja
disimpan sebagai secret karena repo ini publik.

| Secret | Isi |
|---|---|
| `DEPLOY_SSH_KEY` | Kunci privat deploy (`~/.ssh/asdf-rekalogika-deploy`) |
| `DEPLOY_KNOWN_HOSTS` | Sidik jari server, dari `ssh-keygen -F "[<host>]:<port>"` |
| `DEPLOY_HOST` | Hostname server SSH |
| `DEPLOY_PORT` | Port SSH |
| `DEPLOY_USER` | User akun hosting |

### Mengganti kunci deploy

Lakukan ini jika kunci bocor atau secara berkala:

1. `ssh-keygen -t ed25519 -N "" -C "github-actions-asdf" -f ~/.ssh/asdf-rekalogika-deploy-new`
2. Tambahkan kunci publiknya lewat panel, dengan awalan `command="…",restrict` seperti di atas.
3. `gh secret set DEPLOY_SSH_KEY < ~/.ssh/asdf-rekalogika-deploy-new`
4. Jalankan workflow secara manual dan pastikan hijau.
5. Hapus kunci lama di panel, lalu hapus file kunci lama di laptop.

Untuk menguji kunci dari laptop, abaikan `~/.ssh/config` dan ssh-agent supaya yang dipakai
benar-benar kunci deploy, bukan kunci pribadi:

```bash
ssh -F /dev/null -o IdentityAgent=none -o IdentitiesOnly=yes \
  -o UserKnownHostsFile=~/.ssh/known_hosts \
  -p <port> -i ~/.ssh/asdf-rekalogika-deploy <user>@<host> ls
# hasil yang benar: "rrsync error: SSH_ORIGINAL_COMMAND does not run rsync"
```

### Deploy manual (cadangan)

Jika GitHub Actions bermasalah, deploy bisa dilakukan dari laptop dengan kunci pribadi:

```bash
npm run build
rsync -az --delete --chmod=D755,F644 -e "ssh -p <port>" \
  build/ <user>@<host>:public/asdf.rekalogika.com/
```

`build/` harus diakhiri garis miring. Tambahkan `-n --itemize-changes` untuk dry run.

### Catatan server

- Web server berjalan sebagai user `<user>-www`. ACL bawaan document root sudah memberinya
  akses baca, jadi tidak perlu `chwperm` setelah rsync.
- [`static/.htaccess`](static/.htaccess) ikut ter-deploy dan mengatur halaman 404 Docusaurus
  serta cache (HTML `no-cache`, JS/CSS ber-hash 1 tahun).
- `trailingSlash: true` di `docusaurus.config.ts` menyesuaikan URL dengan cara Apache
  menyajikan `folder/index.html`.
- HTTPS dan sertifikat diurus otomatis oleh panel.

### Troubleshooting

| Gejala | Kemungkinan penyebab |
|---|---|
| Job build merah | Link rusak, frontmatter salah, atau error MDX. Jalankan `npm run build` di lokal. |
| Job deploy merah di langkah rsync | Secret salah/kedaluwarsa atau kunci dihapus dari panel. Lihat `gh run view --log-failed`. |
| Deploy hijau tetapi artikel tidak muncul | `draft: true` masih ada, atau cache browser (Ctrl+Shift+R). |
| Halaman 403 | Document root kosong atau tidak terbaca oleh web server. |

## Tampilan

- Warna: `src/css/custom.css` (generator palet: https://docusaurus.io/docs/styling-layout)
- Navbar, footer, mode terang/gelap, tema blok kode: `themeConfig` di `docusaurus.config.ts`
- Judul, tagline: `title` dan `tagline` di `docusaurus.config.ts`
- Logo navbar: `static/img/logo.svg` (logo Rekalogika); favicon: `static/img/favicon.ico`,
  dibuat dari logo dengan:
  `rsvg-convert -w 256 -h 256 static/img/logo.svg | magick - -define icon:auto-resize=48,32,16 static/img/favicon.ico`
- Gambar preview media sosial: `static/img/social-card.png` (1200×630), sumbernya
  `design/social-card.svg`. Setelah mengedit SVG, buat ulang dengan:
  `rsvg-convert -w 1200 -h 630 design/social-card.svg -o static/img/social-card.png`
