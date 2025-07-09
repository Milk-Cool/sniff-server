export default function fillChart(rawData) {
    return new Array(100).fill(0).map((_x, i) => {
        const raw = rawData.find(x => x.percentage === i);
        if(raw) return raw;
        const next = rawData.find(x => x.percentage > i);
        const prev = rawData.findLast(x => x.percentage < i);
        const timestamp = next && prev
            ? prev.timestamp + (next.timestamp - prev.timestamp) * (i - prev.percentage) * 0.01
            : next
            ? next.timestamp
            : prev
            ? prev.timestamp
            : 0;
        return { percentage: i, cnt: 0, cntMac: 0, timestamp: timestamp };
    });
};