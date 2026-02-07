const API = "https://mbma.my20130910.workers.dev";

// 1 = bilibili, 2 = netease
const DEFAULT_SOURCE = 2;

const ap = new APlayer({
    container: document.getElementById('aplayer'),
    fixed: true,
    mini: true,
    lrcType: 1,
    audio: []
});

// 搜索
document.getElementById("music-search").addEventListener("keydown", async (e) => {
    if (e.key !== "Enter") return;

    const keyword = e.target.value.trim();
    if (!keyword) return;

    // 搜索时带上 source
    const res = await fetch(`${API}/search?keyword=${encodeURIComponent(keyword)}&source=${DEFAULT_SOURCE === 1 ? "bilibili" : "netease"}`)
        .then(r => r.json())
        .catch(() => null);

    if (!res || !Array.isArray(res.data) || !res.data.length) return;

    ap.list.clear();

    for (const song of res.data) {

        // 每个 song 必须带 source
        const source = song.source || (DEFAULT_SOURCE === 1 ? "bilibili" : "netease");

        // 获取歌曲 URL
        const songRes = await fetch(`${API}/song?id=${song.id}&source=${source}`)
            .then(r => r.json())
            .catch(() => null);
console.log("SONG API RESULT:", song.id, song.source, songRes);

        if (!songRes || !songRes.url) continue; // URL 无效就跳过

        // 获取歌词（只有网易云有）
        let lyric = "";
        if (source === "netease") {
            const lyricRes = await fetch(`${API}/lyric?id=${song.id}`)
                .then(r => r.json())
                .catch(() => null);

            lyric = lyricRes?.raw || "";
        } else {
            lyric = "很抱歉，B站没有歌词这玩意"; // B 站默认歌词
        }

        ap.list.add({
            name: song.title,
            artist: song.artist,
            url: songRes.url,
            cover: song.artwork || "",
            lrc: lyric
        });
    }

    ap.list.switch(0);
    ap.play();
});
