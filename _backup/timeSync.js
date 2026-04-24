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
        const timeElement = document.getElementById('current-time');
        if (timeElement) {
            timeElement.innerText = formatter.format(now);
        }
    }

    updateTime();

    const now = new Date();
    const seconds = now.getSeconds();
    const milliseconds = now.getMilliseconds();
    const delayUntilNextMinute = (60 - seconds) * 1000 - milliseconds;

    setTimeout(function() {
        updateTime();
        setInterval(updateTime, 60000);
    }, delayUntilNextMinute);