// Bahasa Indonesia UI text. Must have exactly the keys of en.ts.
import type { Day } from "@/lib/opening";
import type { Dictionary } from "./en";

const SHORT_DAYS: Record<Day, string> = {
  mon: "Sen",
  tue: "Sel",
  wed: "Rab",
  thu: "Kam",
  fri: "Jum",
  sat: "Sab",
  sun: "Min",
};

export const id: Dictionary = {
  meta: {
    description: "Pilih tempat buat nongkrong, kencan, atau makan.",
  },
  common: {
    back: "Kembali",
    change: "Ubah",
    clear: "Hapus",
    any: "Semua",
    locating: "Mencari lokasimu…",
    noGeolocation: "Lokasi tidak tersedia di browser ini.",
    away: (distance) => `berjarak ${distance}`,
    share: "Bagikan",
    linkCopied: "Link disalin",
  },
  header: {
    toggleTheme: "Ganti tema",
    switchTo: "Switch to English",
  },
  home: {
    title: "Mau ke mana?",
    browseAll: "Lihat semua tempat",
  },
  categories: {
    restaurant: { label: "Restoran", plural: "Restoran" },
    cafe: { label: "Kafe", plural: "Kafe" },
    dessert: { label: "Dessert", plural: "Dessert" },
    mall: { label: "Mal", plural: "Mal" },
    park: { label: "Taman", plural: "Taman" },
    bar: { label: "Bar", plural: "Bar" },
  },
  tags: {
    wifi: "Wi-Fi",
    work: "Nyaman buat kerja",
    outdoor: "Area outdoor",
    halal: "Halal",
    parking: "Parkir",
    kids: "Ramah anak",
    smoking: "Area merokok",
  },
  prices: {
    1: "Di bawah Rp 50rb per orang",
    2: "Rp 50–150rb per orang",
    3: "Di atas Rp 150rb per orang",
  },
  intents: {
    coffee: "Ngopi atau tempat santai",
    hangout: "Nongkrong bareng teman",
    eat: "Cari makan",
    work: "Kerja atau belajar",
  },
  wizard: {
    whatTitle: "Mau cari apa?",
    anything: "Apa saja",
    changeWhat: "Ganti yang kamu cari",
    fromTitle: "Berangkat dari mana?",
    myLocation: "Lokasiku",
    somewhereElse: "Tempat lain",
    ferry: "Baru tiba naik feri",
    ferryHint: "Dari Singapura: HarbourBay, Batam Centre…",
    ferryTitle: "Terminal mana?",
    ferryNote: "Pelabuhan tempat feri dari Singapura bersandar.",
    tapToChange: "Ketuk untuk ganti",
    skip: "Langsung ke hasil",
    skipHint: "Dekat aku, berangkat sekarang",
    changeFrom: "Ganti titik berangkat",
    locationFailed: "Lokasimu tidak bisa didapat. Pilih area saja?",
    whenTitle: "Kapan berangkat?",
    now: "Sekarang",
    pickTime: "Pilih waktu",
    pickTimeHint: "Nanti malam, besok, akhir pekan...",
    leavingFrom: "Berangkat dari",
    leavingAt: "Berangkat jam",
    searchAreas: "Cari area",
    searchPlaceholder: "Cari area",
    areas: "Area",
    recent: "Terakhir dipilih",
    typeHint: "Ketik nama area, misalnya Nagoya atau Batam Centre.",
    noAreas: (query) =>
      `Tidak ada area yang cocok dengan “${query}”. Coba area di dekatnya.`,
  },
  timePicker: {
    inAnHour: "1 jam lagi",
    tonight: "Malam ini jam 7",
    tomorrowLunch: "Besok makan siang",
    weekend: "Akhir pekan ini",
    today: "Hari ini",
    tomorrow: "Besok",
    day: "Hari",
    hour: "Jam",
    minute: "Menit",
    period: "AM atau PM",
    tooEarly: "Pilih waktu yang lebih nanti",
    show: (when) => `Lihat tempat · ${when}`,
  },
  browser: {
    allPlaces: "Semua tempat",
    pickForMe: "Pilihkan satu",
    shareResults: "Bagikan hasil ini",
    shareText: "Beberapa tempat seru di Batam",
    from: (area) => `Dari ${area}`,
    leaving: (when) => `Berangkat ${when}`,
    view: "Tampilan",
    map: "Peta",
    list: "Daftar",
    search: "Cari tempat",
    filters: "Filter",
    category: "Kategori",
    categories: "Kategori",
    allCategories: "Semua",
    selected: (count) => `${count} dipilih`,
    status: "Status",
    openNow: "Buka sekarang",
    closedNow: "Tutup sekarang",
    distance: "Jarak",
    features: "Fasilitas",
    allFeatures: "Semua",
    price: "Harga",
    priceUpTo: (symbol, max) => `${symbol} · ${max}`,
    priceMax: {
      1: "di bawah Rp 50rb",
      2: "di bawah Rp 150rb",
    },
    within: (km) => `Dalam ${km} km`,
    locationFailed: "Lokasimu tidak bisa didapat.",
    places: (count) => `${count} tempat`,
    someOf: (count, total) => `${count} dari ${total} tempat`,
    clearAll: "Hapus semua",
    sort: "Urutkan",
    sortDefault: "Default",
    sortName: "Nama (A–Z)",
    sortNearest: "Terdekat",
    editFilters: "Ubah filter",
    clearFilters: "Hapus filter",
    closed: "tutup",
    legendClosed: "Tutup",
    you: "Kamu",
    startingPoint: (area) => `Titik berangkat: ${area}`,
    noMatches: "Tidak ada tempat yang cocok.",
    empty: "Belum ada tempat di sini.",
  },
  place: {
    backTo: (plural) => `Kembali ke ${plural}`,
    photoBy: "Foto oleh:",
    navigate: "Rute",
    shareText: (name) => `${name}, ketemu di WhereToGo`,
    about: "Tentang",
    goodToKnow: "Info tambahan",
    openingHours: "Jam buka",
    website: "Situs web",
    on: (name, site) => `${name} di ${site}`,
    itsWebsite: "situs webnya",
    localTime: (timezone) =>
      `Waktu mengikuti zona waktu tempat ini (${timezone})`,
  },
  hours: {
    days: {
      mon: "Senin",
      tue: "Selasa",
      wed: "Rabu",
      thu: "Kamis",
      fri: "Jumat",
      sat: "Sabtu",
      sun: "Minggu",
    },
    closed: "Tutup",
    allDay: "Buka 24 jam",
  },
  status: (s) => {
    switch (s.kind) {
      case "always":
        return "Buka 24 jam";
      case "never":
        return "Tutup";
      case "open":
        return `Buka · Tutup ${s.closes}`;
      case "closed": {
        const when =
          s.on === "today"
            ? ""
            : s.on === "tomorrow"
              ? "besok "
              : `${SHORT_DAYS[s.on]} `;
        return `Tutup · Buka ${when}${s.opens}`;
      }
    }
  },
  feedback: {
    toggle: "Kirim masukan",
    topicsLegend: "Tentang apa?",
    topics: {
      place: "Usulkan tempat",
      wrong: "Ada yang salah",
      idea: "Ide",
      other: "Lainnya",
    },
    message: "Pesanmu",
    messagePlaceholder:
      "Apa yang sudah bagus, apa yang belum, atau tempat yang perlu ditambah",
    messageRequired: "Tulis beberapa kata dulu.",
    tooLong: (max) => `Maksimal ${max} karakter.`,
    contact: "Ke mana kami bisa membalas?",
    optional: "Opsional",
    contactPlaceholder: "Email atau username Telegram",
    send: "Kirim masukan",
    sending: "Mengirim…",
    thanksTitle: "Terima kasih atas masukannya",
    thanksBody: "Pesanmu langsung sampai ke Ricky, dan semuanya dibaca.",
    sendAnother: "Kirim lagi",
    errors: {
      invalid: "Permintaan tidak valid.",
      empty: "Tulis sesuatu dulu.",
      tooLong: "Pesannya terlalu panjang.",
      rateLimited: "Terlalu banyak pesan. Coba lagi nanti.",
      failed: "Belum bisa terkirim. Coba lagi nanti.",
    },
  },
  footer: {
    builtBy: "Dibuat oleh",
    tagline: ", buat kamu yang bingung mau ke mana.",
  },
  notFound: {
    title: "Tidak ada apa-apa",
    body: "Halaman ini tidak ada.",
    home: "Kembali ke beranda",
  },
};
