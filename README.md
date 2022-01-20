# Airforce internet mailer

### 이게 뭐 하는 건가요?

여러 디씨 갤러리 개념글과, 주식들을 정리해서 자동으로 메일로 보내줘요.

주기적으로 새로운 글을 확인해서, 중복되지 않게, 올라온 글을 정리해줘요.
개장 시간에 주기적으로 특정한 주식이나, 여러 지표를 정리해서 보내줘요.

공군 친구가 인터넷 편지 많이 써달라면서, 링크들을 주더니 여기 올라오는 것 좀 보내달라고 해서 만들었어요.

---

### 어떻게 쓰는 건가요?

1. 먼저, node.js의 설치가 필요해요. [Node.js 다운로드](https://nodejs.org/ko/download/)
  
2. 다운받은 폴더에서 터미널을 실행한 뒤 필요한 모듈을 설치해요.
  
      ``` npm install puppeteer node-schedule axios ```
  

![pic1](https://user-images.githubusercontent.com/67845112/150377190-99398b9e-ef0c-408d-985e-596b663931f0.png)

3. 프로그램을 실행한 뒤 필요한 정보를 입력해요.
  
      ``` node main.js ```
  
      주식 기능을 이용하고 싶다면, [Yahoo Finance API](https://www.yahoofinanceapi.com/dashboard) 에서 'API key' 를 찾아 써주세요.
![pic2](https://user-images.githubusercontent.com/67845112/150377742-7f2ac50a-769f-410c-b3d0-840271ece448.png)

4. 정상적으로 작동한다면, 메일함에서 메일을 확인할 수 있어요.
![pic3](https://user-images.githubusercontent.com/67845112/150379554-f8f3dffa-e93a-4c8f-98bf-186d150b8964.png)

---

### 사용한 도구들

**node.js** : [Node.js](https://nodejs.org/ko/)

**puppeteer** : [GitHub - puppeteer/puppeteer: Headless Chrome Node.js API](https://github.com/puppeteer/puppeteer)

**node-schedule** : [GitHub - node-schedule/node-schedule: A cron-like and not-cron-like job scheduler for Node.](https://github.com/node-schedule/node-schedule)

**axios** : [GitHub - axios/axios: Promise based HTTP client for the browser and node.js](https://github.com/axios/axios)
