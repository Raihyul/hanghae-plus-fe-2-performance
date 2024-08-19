# 성능 개선 보고서

| AS-IS | TO-BE |
| --- | --- |
| <img width="500" alt="image" src="https://github.com/user-attachments/assets/7d732225-8933-40e8-8c28-3b339b88751d"> | <img width="500" alt="image" src="https://github.com/user-attachments/assets/68d46ccf-5782-4f13-b0f5-490c90b8e7a1"> |

| 성능 개선 사항 | 개선된 지표 | 개선 방법 | 성능 지표 변화 |
| --- | --- | --- | --- |
| 차세대 형식을 사용해 이미지 제공 | LCP, FCP | jpg, png → webp 변경<br />서버에서 받아오는 이미지 webp 변경 | 30 → 50 (+20) |
| 반응형 이미지 표시 | LCP, FCP | hero 이미지 파일에 media 처리 추가 | 50 → 55 (+5) |
| 이미지에 width, height 값 주기 | CLS | media query를 사용하여 너비에 따라 다른 값 사용 | 55 → 67 (+12) |
| country banner 이동 방지 | CLS | hidden 속성으로 숨겨졌다가 나타나는 부분 제거 | 67 → 52 (-15) |
| 오픈 스크린 이미지 지연 | LCP, FCP | lazy loading 처리 추가 | 52 → 63 (+11) |
| 자바스크립트 실행 시간 단축 & 기본 스레드 작업 최소화 | TBT | 페이지 초기 로드 시 즉시 실행되던 제품 로딩 및 무거운 연산을 사용자의 스크롤 위치에 따라 필요한 시점에 지연 실행하도록 최적화 | 63 → 87 (+14) |
| 무거운 연산 개선 | TBT | 무거운 연산을 작은 덩어리로 나누어 비동기적으로 처리<br />Promise를 활용하여 작업 완료를 효율적으로 관리<br />상태 추적 및 에러 처리를 개선 | 87 → 87 (-) |
| 작업을 작은 단위로 나누고 비동기적으로 처리 | TBT | requestAnimationFrame과 시간 기반 청크 처리를 활용하여 브라우저의 렌더링 주기에 맞춘 동적 작업 분배를 구현 | 87 → 87 (-) |
| 렌더링 차단 리소스 제거 | LCP, FCP | 폰트 직접 호스팅 | 87 → 93 (+6) |
| 랜더링 차단 리소스 제거 | LCP, FCP | 스크립트에 defer 속성을 추가하고 DOMContentLoaded 이벤트를 사용하여 HTML 문서 로딩 완료 후 스크립트가 실행되도록 최적화 | 93 → 96 (+3) |
| 이미지 크기 적절하게 설정 | LCP, FCP | webp 이미지 사이즈 변경 | 96 → 97 (+1) |

1. LCP (Largest Contentful Paint): 주요 콘텐츠 로딩 속도, 가장 큰 콘텐츠 요소의 렌더링 시점 측정
2. TBT (Total Blocking Time) : 페이지 응답성 평가, 페이지 렌더링 후 상호작용 가능 시점까지의 차단 시간 합산
3. CLS (Cumulative Layout Shift) : 시각적 안정성 평가, 페이지 로드 중 예기치 않은 레이아웃 이동 정도 측정
4. SI (Speed Index) : 전체적인 페이지 로딩 속도, 페이지 콘텐츠의 시각적 로딩 속도 측정
5. FCP (First Contentful Paint) : 사용자의 페이지 로딩 시작 인식 순간, 첫 번째 콘텐츠 렌더링 시점 측정

---
## 1. 차세대 형식을 사용해 이미지 제공
- jpg, png 파일을 직접 webp로 변환환하여 변경
- 서버에서 받아오는 이미지를 webp 형식으로 변경
  ```javascript
  // jpg를 webp로 변환하는 함수
  function convertToWebp(imageUrl, altText) {
      return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "Anonymous";  // CORS 이슈 방지
          img.onload = function() {
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0);
              canvas.toBlob(blob => {
                  const url = URL.createObjectURL(blob);
                  resolve(url);
              }, 'image/webp');
          };
          img.onerror = reject;
          img.src = imageUrl;
      });
  }
  
  function displayProducts(products) {
      const container = document.querySelector('#all-products .container');
  
      products.forEach(product => {
          const productElement = document.createElement('div');
          productElement.classList.add('product');
  
          const pictureDiv = document.createElement('div');
          pictureDiv.classList.add('product-picture');
  
          // 이미지를 webp로 변환하는 함수 호출
          convertToWebp(product.image, product.title).then(webpUrl => {
              const img = document.createElement('img');
              img.src = webpUrl;
              img.alt = `product: ${product.title}`;
              img.width = 250;
              pictureDiv.appendChild(img);
          });
  
          // ... (나머지 코드는 그대로 유지)
      });
  }
  ```

## 2. 반응형 이미지 표시
- styles.css 파일에서 Desktop. tablet, mobile 처리 삭제
- hero 이미지 파일에 media 처리 추가
  ```html
  <picture>
    <source class="mobile" media="(max-width: 575px)" srcset="images/Hero_Mobile.webp" type="image/webp">
    <source class="tablet" media="(min-width: 576px) and (max-width: 960px)" srcset="images/Hero_Tablet.webp" type="image/webp">
    <img class="desktop" src="images/Hero_Desktop.webp" alt="hero image for desktop">
  </picture>
  ```

## 3. 이미지에 width, height 값 주기
- media query를 사용하여 너비에 따라 다른 값 사용
  ```html
  <picture>
    <source width="576" height="576" media="(max-width: 575px)" srcset="images/Hero_Mobile.webp" type="image/webp">
    <source width="960" height="770" media="(min-width: 576px) and (max-width: 960px)" srcset="images/Hero_Tablet.webp" type="image/webp">
    <img width="1920" height="893" src="images/Hero_Desktop.webp" alt="hero image for desktop">
  </picture>
  ```
- convertToWebp() 함수에서 생성되는 webp 이미지에도 width, height 설정
  ```javascript
    convertToWebp(product.image, product.title).then(webpUrl => {
      const picture = document.createElement('picture');

      // 961px 이상
      const source1 = document.createElement('source');
      source1.srcset = webpUrl;
      source1.media = '(min-width: 961px)';
      source1.width = 154;
      source1.height = 154;
      picture.appendChild(source1);

      // 403px 이상 576px 이하
      const source2 = document.createElement('source');
      source2.srcset = webpUrl;
      source2.media = '(min-width: 403px) and (max-width: 576px)';
      source2.width = 128;
      source2.height = 128;
      picture.appendChild(source2);

      // 577px 이상 960px 이하 또는 402px 이하
      const img = document.createElement('img');
      img.src = webpUrl;
      img.alt = `product: ${product.title}`;
      img.width = 72;
      img.height = 72;
      img.className = 'product-image';  // 공통 클래스 추가

      picture.appendChild(img);
      pictureDiv.appendChild(picture);
    });
  ```
## 4. country banner 이동 방지
- hidden 속성으로 숨겨졌다가 나타나는 부분 제거

## 5. 오픈 스크린 이미지 지연
- lazy loading 처리 추가

## 6. 자바스크립트 실행 시간 단축 & 기본 스레드 작업 최소화
- 주요 변경 사항
  1. 지연 로딩 (Lazy Loading) 구현:
      - 기존 코드에서는 페이지 로드 즉시 `loadProducts()`를 실행
      - 변경된 코드에서는 `window.onload` 이벤트 핸들러 내에서 스크롤 이벤트를 감지하도록 설정
      - 사용자가 제품 섹션에 도달할 때까지 `loadProducts()`의 실행을 지연
  2. 조건부 실행:
      - `status` 변수를 사용하여 `loadProducts()` 함수가 한 번만 실행되도록 제어
      - 제품 섹션의 위치를 계산하여 사용자가 해당 섹션에 도달했을 때만 로직을 실행
  3. 무거운 연산 지연:
      - 기존 코드에서는 페이지 로드 직후 무거운 연산(for 루프)을 즉시 실행
      - 변경된 코드에서는 이 연산을 제품 로딩과 함께 지연
- 주요 이점
  1. 초기 페이지 로드 시간 단축:
      - 제품 데이터 로딩과 무거운 연산이 페이지 초기 로드 시 실행되지 않으므로, 초기 페이지 렌더링 속도가 향상
  2. 사용자 경험 개선:
      - 사용자가 실제로 제품 섹션을 보려고 할 때만 데이터를 로드하므로, 불필요한 데이터 로딩을 방지
  3. 리소스 효율성:
      - 사용자가 제품 섹션을 보지 않는 경우 불필요한 API 호출과 연산을 하지 않아 서버 리소스와 클라이언트의 처리 능력을 절약
    
## 7. 무거운 연산 개선
- 주요 변경 사항
  1. `heavyOperation` 함수 도입:
      - 무거운 연산을 별도의 함수로 분리
      - 이 함수는 Promise를 반환하여 비동기 처리 가능
  2. 작업 분할 (Chunking):
      - 전체 작업을 작은 덩어리(chunk)로 나눕니다. 기본값으로 10,000회 반복마다 나누도록 설정
      - 각 덩어리 처리 후 `setTimeout`을 사용하여 다음 프레임으로 실행 연기
  3. 비동기 처리:
      - `setTimeout`을 사용하여 각 작업 덩어리를 비동기적으로 실행
      - 이를 통해 메인 스레드가 다른 작업(예: UI 업데이트)을 처리할 수 있는 시간을 확보
  4. Promise 사용:
      - `heavyOperation` 함수가 Promise를 반환하므로 작업 완료 대기
      - `async/await`를 사용하여 비동기 코드를 깔끔하게 처리
  5. 상태 관리 개선:
      - 작업 시작 시 `status`를 'loading'으로, 완료 시 'completed'로 변경
      - 이를 통해 중복 실행을 방지하고 현재 상태를 정확히 추적
  6. 에러 처리:
      - `try/catch` 블록을 사용하여 에러 상황을 처리합니다.
- 주요 이점:
  1. UI 반응성 향상:
    - 무거운 연산이 메인 스레드를 장시간 블로킹하지 않아 UI가 반응적으로 유지
  2. 리소스 효율성
    - 작업을 작은 단위로 나누어 처리함으로써 브라우저가 다른 중요한 작업을 수행할 시간을 확보
  3. 사용자 경험 개선:
    - 페이지가 멈추거나 느려지는 현상이 크게 감소
 
## 8. 작업을 작은 단위로 나누고 setTimeout이나 requestAnimationFrame을 사용하여 비동기적으로 처리
- 주요 변경사항:
  1. requestAnimationFrame 사용
  2. 시간 기반 청크 처리 도입
  3. 동적 작업 분배 구현
  4. 성능 측정 코드 추가
- 주요 이점:
  1. 향상된 UI 반응성
  2. 효율적인 리소스 사용
  3. 다양한 기기에서의 적응형 성능
  4. 정확한 진행 상황 추적 가능
  5. 디버깅 및 성능 최적화 용이성
 
## 9. 랜더링 차단 리소스 제거하기
- 폰트 직접 호스팅

## 10. 렌더링 차단 리소스 제거하기
- 주요 변경 사항
  1. `defer` 속성 추가:
    - 두 `<script>` 태그에 `defer` 속성 추가
    - 효과: 이 속성은 브라우저에게 스크립트의 실행 지연 지시. 스크립트는 다운로드되지만, HTML 문서가 완전히 로드된 후에 실행
  2. `DOMContentLoaded` 이벤트 리스너 사용:
    - `cookieconsent.run()` 함수 호출이 `DOMContentLoaded` 이벤트 리스너 내부로 이동
    - 효과: 이는 DOM이 완전히 로드된 후에 쿠키 동의 스크립트가 실행되도록 보장
- 주요 이점:
  1. 페이지 로딩 성능 향상:
      - `defer` 속성으로 인해 스크립트 로딩이 페이지 렌더링을 차단하지 않음
      - 이는 특히 큰 스크립트 파일의 경우 초기 페이지 로드 시간을 개선
  2. 실행 순서 보장:
      - `DOMContentLoaded` 이벤트를 사용함으로써, 쿠키 동의 스크립트가 DOM이 준비된 후에 실행되도록 보장
      - 이는 스크립트가 필요로 하는 DOM 요소들이 모두 로드된 후에 실행되므로, 잠재적인 오류를 방지
  3. 더 안정적인 실행:
      - 페이지의 다른 요소들이 모두 로드된 후에 쿠키 동의 스크립트가 실행되므로, 사용자 경험이 더 일관성 있게 유지
  4. 리소스 로딩 최적화:
      - 브라우저가 페이지 로딩을 더 효율적으로 관리

## 11. 이미지 크기 적절하게 설정하기
- webp 파일 이미지 크기 조절
