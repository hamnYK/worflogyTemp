## 투자 참조

- 2025.10.10 Revision
- <a href="https://drive.google.com/file/d/1tgK9Kl2X68F4IIMqCcvfpUHWYIeBZyCQ/view?usp=sharing" target="_blank">한국어 IR 자료 다운로드</a>

![IR Cover Page](/IR/1_cover.PNG)
![Company Information](/IR/2_company_info.PNG)
![Target Market](/IR/3_markets.PNG)
![Market Opportunities and Capabilities](/IR/4_market_opp.PNG)
![Market Opportunity: Domain Expert's Pain Point ‘AX of Decision Making with xAI on Human-factor’](/IR/5_market_opp_ev1.PNG)
![Market Opportunity: Solution Provider's Pain Point ‘Rethinking GRC in AI Era Seminar (2025.09.24)’](/IR/6_market_opp_ev2.PNG)
![Why it's possible: A fundamental design approach that can cover the industry's pain points](/IR/7_pos_ana1.PNG)
![Why it's possible: The CEO](/IR/8_pos_ana2.PNG)
![Why it's possible: Available Resources](/IR/9_pos_ana3.PNG)
![Why it's possible: Continuous industry-academia cooperation with Korea University's AI Research Institute, specializing in LLM](/IR/10_pos_ana4.PNG)
![How we'll do it: Technology protected by IP (Confidential)](/IR/11_how1.PNG)
![How we'll do it: Workflow Scenario](/IR/12_how2.PNG)
![How we'll do it: Swift Investment Attraction & Productization  Market Entry through Global PoC](/IR/13_how3.PNG)
![Plan](/IR/14_plan.PNG)
![Q&A](/IR/15_contact.PNG)

## 데모 PoC

- In Progress (2025.10.10 Revision) | <a href="#" id="start-demo-link">Demo Link</a><br>기술 스택 검증 | IF·BM·DB 개발·테스트 환경 설정 (2025.10.23)
- <a href="https://drive.google.com/file/d/1Nsm9IdolCJ3Vi6HguaNp3o6vA1YL-AZE/view?usp=sharing" target="_blank">Docs 다운로드</a>

![0. Overall Flow](/demo/0.%20Overall%20Flow.png)
![1. Overall System](/demo/1.%20Overall%20System%20P1.png)
![2. Overall System with Components](/demo/2.%20Overall%20System%20P2.png)
![3. Status Transformation](/demo/3.%20Status%20Transformation.png)
![4. Atomic Link Object Data Structure](/demo/4.%20Atomic%20Link%20Object%20DS.png)
![5. Hypothesis Feedback](/demo/5.%20Hypothesis%20Feedback.png)
![6. Workflow Forced Modes](/demo/6.%20Workflow%20Forced%20Modes.png)
![7. Cognitive Inference Model](/demo/7.%20Cognitive%20Inference%20Model.png)
![8. AI Subkeys Generation](/demo/8.%20AI%20Subkeys%20Generation.png)
![9. Terminology Nominalisation](/demo/9.%20Terminology%20Nominalisation.png)
![10. Event Audit](/demo/10.%20Event%20Audit.png)
![11. Cross T-Box Recommendation](/demo/11.%20Cross%20T-Box%20Recommendation.png)
![12. Voting Governance Procedure](/demo/12.%20Voting%20Governance%20Procedure.png)
![13. Context Fork EM](/demo/13.%20Context%20Fork%20EM.png)
![14. A-Box and T-Box Life Cycle](/demo/14.%20A-Box%20and%20T-Box%20Life%20Cycle.png)

- **투자 의향 & IP · Know-How 기술 이전** | 자유롭게 문의하세요.

<div id="worflogy-chat-button">
  <span>💬</span>
</div>
<div id="worflogy-chat-container">
  <button id="worflogy-chat-close">✖</button>
  <iframe id="worflogy-chat-iframe" frameborder="0"></iframe>
</div>

<style>
  /* 플로팅 버튼 스타일 */
  #worflogy-chat-button {
    position: fixed;
    bottom: 25px;
    left: 25px; /* 요청사항: 좌측 하단 */
    width: 60px;
    height: 60px;
    background-color: #4338CA; /* 사이트 테마 색상 */
    color: white;
    border-radius: 50%;
    display: none; /* 초기에는 숨김 */
    justify-content: center;
    align-items: center;
    font-size: 28px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 9998;
    transition: transform 0.2s ease-in-out;
  }
  #worflogy-chat-button:hover {
      transform: scale(1.1);
  }

  /* 채팅 컨테이너 스타일 */
  #worflogy-chat-container {
    position: fixed;
    bottom: 25px;
    left: 25px; /* 요청사항: 좌측 하단 */
    width: 375px; /* 모바일 가로 사이즈 */
    height: 70vh; /* 화면 높이의 70% */
    max-height: 800px;
    background-color: #ffffff; /* 사이트 테마 색상 */
    border-radius: 16px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.25);
    display: none; /* 초기에는 숨김 */
    flex-direction: column;
    overflow: hidden;
    z-index: 9999;
    border: 1px solid #e2e8f0; /* 사이트 테마 색상 */
  }

  #worflogy-chat-container iframe {
    flex-grow: 1;
    border: none;
  }

  #worflogy-chat-close {
    position: absolute;
    top: 12px;
    right: 12px;
    background: none;
    border: none;
    font-size: 24px;
    line-height: 1;
    cursor: pointer;
    color: #A0AEC0;
    padding: 5px;
    z-index: 10000;
  }
  #worflogy-chat-close:hover {
      color: #1a202c; /* 사이트 테마 색상 */
  }
  
  /* UI를 보여주기 위한 클래스 */
  .show-flex { display: flex !important; }
  .show-inline-flex { display: inline-flex !important; }

  /* 모바일 반응형 스타일 */
  @media (max-width: 600px) {
    #worflogy-chat-container {
      width: calc(100% - 20px);
      height: calc(100% - 20px);
      bottom: 10px;
      left: 10px;
      max-height: none;
    }
    #worflogy-chat-button {
      bottom: 15px;
      left: 15px;
    }
  }
</style>

<script>
  // 이 스크립트가 중복 실행되는 것을 방지하기 위한 안전장치
  if (!window.worflogyDemoScriptLoaded) {
    window.worflogyDemoScriptLoaded = true;

    // DOMContentLoaded는 페이지 전체 로딩 시 한 번만 실행되지만, 
    // 여기서는 md 파일이 로드될 때마다 실행될 수 있도록 이벤트를 사용합니다.
    (function() {
      const chatButton = document.getElementById('worflogy-chat-button');
      const chatContainer = document.getElementById('worflogy-chat-container');
      const closeButton = document.getElementById('worflogy-chat-close');
      const chatIframe = document.getElementById('worflogy-chat-iframe');
      
      // **중요**: 여기에 Vercel 등에 배포될 Next.js 클라이언트 앱의 URL을 입력하세요.
      const clientAppUrl = 'YOUR_WORFLOGY_CLIENT_APP_URL'; 

      // 1. 'Demo Link' 클릭 시 플로팅 버튼 활성화
      const demoLink = document.getElementById('start-demo-link');
      if (demoLink) {
        demoLink.addEventListener('click', function(e) {
          e.preventDefault(); // 링크의 기본 동작(페이지 이동) 방지
          if (chatButton) chatButton.classList.add('show-inline-flex');
        });
      }

      // 2. 플로팅 버튼 클릭 시 채팅창 띄우기
      if (chatButton) {
          chatButton.addEventListener('click', function() {
              if (chatContainer && chatIframe) {
                  if (chatIframe.src !== clientAppUrl) {
                      chatIframe.src = clientAppUrl;
                  }
                  chatContainer.classList.add('show-flex');
              }
              chatButton.classList.remove('show-inline-flex');
          });
      }

      // 3. 닫기 버튼 클릭 시 채팅창 숨기기 및 버튼 다시 표시
      if (closeButton) {
          closeButton.addEventListener('click', function() {
              if (chatContainer) chatContainer.classList.remove('show-flex');
              if (chatButton) chatButton.classList.add('show-inline-flex');
          });
      }
    })();
  }
</script>