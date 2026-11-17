/**
 * APP.JS - Sistem Koreksi Ujian Otomatis Berbasis AI
 * Berisi logika validasi form, manajemen LocalStorage, simulasi AI, dan manipulasi DOM.
 */

// Key LocalStorage
const STORAGE_KEY = "SISTEM_KOREKSI_AI_DATA";
const RUBRIK_KEY = "SISTEM_KOREKSI_AI_RUBRIK";

// --- 1. DATA DEFAULT / INITIALIZATION ---
function inisialisasiDataAwal() {
    if (!localStorage.getItem(STORAGE_KEY)) {
        const dataAwal = [
            {
                id: "KOR-101",
                nim: "230101001",
                nama: "Akmal Fakhruliantoro",
                matkul: "Kecerdasan Buatan",
                tgl: "2026-10-01",
                nilai: 88.5,
                grade: "A",
                status: "Terkoreksi",
                umpanBalik: "Penjelasan mengenai algoritma CNN dan Vision Transformer sangat mendalam dan tepat."
            },
            {
                id: "KOR-102",
                nim: "230101002",
                nama: "Chelsea Julianti",
                matkul: "Pemrograman Web",
                tgl: "2026-10-02",
                nilai: 92.0,
                grade: "A",
                status: "Terkoreksi",
                umpanBalik: "Struktur HTML5 dan CSS Grid sangat rapi. Logika JavaScript validasi berjalan fleksibel."
            },
            {
                id: "KOR-103",
                nim: "230101003",
                nama: "Aldo Zidan Pratama",
                matkul: "Sistem Operasi",
                tgl: "2026-10-03",
                nilai: 58.0,
                grade: "E",
                status: "Perlu Review",
                umpanBalik: "Konsep pemanggilan System Call dan manajemen memori kurang terperinci."
            }
        ];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataAwal));
    }
}

// Fungsi Ambil Data
function AmbilDataKoreksi() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

// Fungsi Simpan Data Baru
function SimpanDataKoreksi(dataBaru) {
    const dataLama = AmbilDataKoreksi();
    dataLama.unshift(dataBaru); // Tambahkan ke baris teratas
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataLama));
}

// Helper Konversi Nilai ke Grade (Pengambilan Keputusan - If/Else)
function hitungGrade(nilai) {
    if (nilai >= 85) return "A";
    if (nilai >= 75) return "B";
    if (nilai >= 65) return "C";
    if (nilai >= 50) return "D";
    return "E";
}

// --- 2. LOGIKA UNTUK HALAMAN UNGGAH JAWABAN ---
function inisialisasiFormUnggah() {
    const formUnggah = document.getElementById("form-unggah-ujian");
    const progressContainer = document.getElementById("progress-container");
    const progressBar = document.getElementById("progress-bar");
    const statusText = document.getElementById("status-proses");

    if (!formUnggah) return;

    formUnggah.addEventListener("submit", function (e) {
        e.preventDefault();

        // Validasi Input
        const nim = document.getElementById("nim").value.trim();
        const nama = document.getElementById("nama_mahasiswa").value.trim();
        const matkul = document.getElementById("matkul").value.trim();
        const fileInput = document.getElementById("file_ujian");

        if (nim === "" || nama === "" || matkul === "" || fileInput.files.length === 0) {
            alert("[Peringatan] Mohon lengkapi seluruh field dan pilih file lembar jawaban!");
            return;
        }

        const file = fileInput.files[0];
        const validTypes = ["application/pdf", "image/jpeg", "image/png"];
        if (!validTypes.includes(file.type)) {
            alert("[Format Tidak Sesuai] Hanya berkas PDF, JPG, atau PNG yang diperbolehkan!");
            return;
        }

        // Tampilkan Loading Bar & Simulasi AI Processing
        progressContainer.style.display = "block";
        let progress = 0;
        
        const interval = setInterval(() => {
            progress += 20;
            progressBar.style.width = progress + "%";

            if (progress === 20) statusText.innerText = "Membaca teks dokumen (OCR)...";
            if (progress === 60) statusText.innerText = "Mencocokkan dengan kunci jawaban & rubrik...";
            if (progress === 80) statusText.innerText = "Mengkalkulasi skor & memformulasi feedback...";

            if (progress >= 100) {
                clearInterval(interval);
                statusText.innerText = "Koreksi AI Selesai!";

                // Generate Nilai Acak Terintegrasi Simulasi AI (60 - 98)
                const nilaiRandom = Math.floor(Math.random() * (98 - 60 + 1)) + 60;
                const dataHasil = {
                    id: "KOR-" + Math.floor(100 + Math.random() * 900),
                    nim: nim,
                    nama: nama,
                    matkul: matkul,
                    tgl: new Date().toISOString().split('T')[0],
                    nilai: nilaiRandom,
                    grade: hitungGrade(nilaiRandom),
                    status: nilaiRandom < 60 ? "Perlu Review" : "Terkoreksi",
                    umpanBalik: `AI mengidentifikasi kelengkapan jawaban sebesar ${nilaiRandom}%. Pemahaman konsep sudah cukup baik.`
                };

                // Simpan ke LocalStorage & Redirect
                SimpanDataKoreksi(dataHasil);
                setTimeout(() => {
                    window.location.href = "dashboard.html";
                }, 1000);
            }
        }, 600);
    });
}

// --- 3. LOGIKA UNTUK HALAMAN DASHBOARD NILAI ---
function inisialisasiDashboard() {
    const tableBody = document.getElementById("tabel-hasil-koreksi");
    if (!tableBody) return;

    const data = AmbilDataKoreksi();
    const totalEl = document.getElementById("stat-total");
    const rataEl = document.getElementById("stat-rata");
    const akurasiEl = document.getElementById("stat-akurasi");
    const searchInput = document.getElementById("search-input");

    // Render Ringkasan Statistik
    function updateStatistik(listData) {
        if (totalEl) totalEl.innerText = listData.length + " Berkas";
        
        if (rataEl) {
            if (listData.length === 0) {
                rataEl.innerText = "0";
            } else {
                const totalNilai = listData.reduce((sum, item) => sum + Number(item.nilai), 0);
                rataEl.innerText = (totalNilai / listData.length).toFixed(1);
            }
        }
        if (akurasiEl) akurasiEl.innerText = "98.4%";
    }

    // Render Tabel Data
    function renderTabel(listData) {
        tableBody.innerHTML = "";
        if (listData.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Data hasil koreksi tidak ditemukan.</td></tr>`;
            return;
        }

        listData.forEach((item) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${item.id}</td>
                <td><strong>${item.nama}</strong><br><small>${item.nim}</small></td>
                <td>${item.matkul}</td>
                <td><span class="badge-nilai grade-${item.grade}">${item.nilai} (${item.grade})</span></td>
                <td><span class="status-badge status-${item.status.replace(/\s+/g, '').toLowerCase()}">${item.status}</span></td>
                <td>${item.tgl}</td>
                <td>
                    <button onclick="lihatDetail('${item.id}')" class="btn-sm btn-detail">Detail</button>
                    <button onclick="hapusData('${item.id}')" class="btn-sm btn-hapus">Hapus</button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    // Pencarian Interaktif
    if (searchInput) {
        searchInput.addEventListener("input", function (e) {
            const keyword = e.target.value.toLowerCase();
            const filtered = data.filter(item => 
                item.nama.toLowerCase().includes(keyword) || 
                item.nim.toLowerCase().includes(keyword) ||
                item.matkul.toLowerCase().includes(keyword)
            );
            renderTabel(filtered);
            updateStatistik(filtered);
        });
    }

    renderTabel(data);
    updateStatistik(data);
}

// Global Handlers untuk tombol di tabel
window.lihatDetail = function (id) {
    window.location.href = `detail_koreksi.html?id=${id}`;
};

window.hapusData = function (id) {
    if (confirm("Apakah Anda yakin ingin menghapus data koreksi ini?")) {
        let data = AmbilDataKoreksi();
        data = data.filter(item => item.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        window.location.reload();
    }
};

// --- 4. LOGIKA UNTUK HALAMAN DETAIL KOREKSI ---
function inisialisasiDetailKoreksi() {
    const detailContainer = document.getElementById("detail-koreksi-container");
    if (!detailContainer) return;

    const urlParams = new URLSearchParams(window.location.search);
    const idParam = urlParams.get("id");

    const data = AmbilDataKoreksi();
    const item = data.find(d => d.id === idParam);

    if (!item) {
        detailContainer.innerHTML = `<h3>Data hasil koreksi tidak ditemukan!</h3><a href="dashboard.html">Kembali ke Dashboard</a>`;
        return;
    }

    document.getElementById("det-nama").innerText = item.nama;
    document.getElementById("det-nim").innerText = item.nim;
    document.getElementById("det-matkul").innerText = item.matkul;
    document.getElementById("det-nilai").innerText = `${item.nilai} / 100 (Grade ${item.grade})`;
    document.getElementById("det-status").innerText = item.status;
    document.getElementById("det-feedback").innerText = item.umpanBalik;
}

// Execution Trigger saat DOM siap
document.addEventListener("DOMContentLoaded", () => {
    inisialisasiDataAwal();
    //inisialisasiFormUnggah();
    inisialisasiDashboard();
    inisialisasiDetailKoreksi();
});