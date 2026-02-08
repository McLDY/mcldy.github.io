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

    const source = DEFAULT_SOURCE === 1 ? "bilibili" : "netease";

    const res = await fetch(`${API}/search?keyword=${encodeURIComponent(keyword)}&source=${source}`)
        .then(r => r.json())
        .catch(() => null);

    if (!res || !Array.isArray(res.data) || !res.data.length) return;

    ap.list.clear();

    for (const song of res.data) {

        // 获取歌词（只有网易云有）
        let lyric = "";
        if (source === "netease") {
            const lyricRes = await fetch(`${API}/lyric?id=${song.id}`)
                .then(r => r.json())
                .catch(() => null);

            lyric = lyricRes?.raw || "";
        } else {
            lyric = "很抱歉，B站没有歌词这玩意";
        }

        // 关键：播放 Worker 的 /stream
        ap.list.add({
            name: song.title,
            artist: song.artist,
            url: `${API}/stream?id=${song.id}&source=${source}`,
            cover: song.artwork || "",
            lrc: lyric
        });
    }

    ap.list.switch(0);
    ap.play();
});
