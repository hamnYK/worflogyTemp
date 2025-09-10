    function updateTime() {
        const now = new Date();
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
            hour: '2-digit',
            minute: '2-digit',
            // second: '2-digit',
            hour12: false,
            timeZone: 'Asia/Seoul'
        };
        const formatter = new Intl.DateTimeFormat('ko-KR', options);
        document.getElementById('current-time').innerText = formatter.format(now);
    }

    setInterval(updateTime, 1000);
    updateTime();