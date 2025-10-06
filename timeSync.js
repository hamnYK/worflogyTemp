function updateTime() {
        const now = new Date();
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
            hour: '2-digit',
            minute: '2-digit',
            // second: '2-digit', // 초 단위는 필요에 따라 추가
            hour12: false,
            timeZone: 'Asia/Seoul'
        };
        const formatter = new Intl.DateTimeFormat('ko-KR', options);
        const timeElement = document.getElementById('current-time');
        if (timeElement) {
            timeElement.innerText = formatter.format(now);
        }
    }

    // 1. 페이지 로드 시 즉시 시간을 한 번 표시
    updateTime();

    // 2. 다음 '정각 분'까지 남은 시간 계산
    const now = new Date();
    const seconds = now.getSeconds();
    const milliseconds = now.getMilliseconds();
    const delayUntilNextMinute = (60 - seconds) * 1000 - milliseconds;

    // 3. 계산된 시간(delay) 후에 첫 업데이트를 실행, 이후 1분(60000ms) 간격으로 계속 업데이트
    setTimeout(function() {
        updateTime(); // 첫 동기화 업데이트
        setInterval(updateTime, 60000); // 이후 1분 간격으로 반복
    }, delayUntilNextMinute);