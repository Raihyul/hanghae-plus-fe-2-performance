async function loadProducts() {
    const response = await fetch("https://fakestoreapi.com/products");
    const products = await response.json();
    displayProducts(products);
}

// jpg를 webp로 변환하는 함수
function convertToWebp(imageUrl) {
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

    // Find the container where products will be displayed
    const container = document.querySelector('#all-products .container');


    // Iterate over each product and create the HTML structure safely
    products.forEach(product => {
        // Create the main product div
        const productElement = document.createElement('div');
        productElement.classList.add('product');

        // Create the product picture div
        const pictureDiv = document.createElement('div');
        pictureDiv.classList.add('product-picture');

        // 이미지를 webp로 변환하는 함수 호출
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
            img.loading = 'lazy'; // lazy loading

            picture.appendChild(img);
            pictureDiv.appendChild(picture);
        });

        // Create the product info div
        const infoDiv = document.createElement('div');
        infoDiv.classList.add('product-info');

        const category = document.createElement('h5');
        category.classList.add('categories');
        category.textContent = product.category;

        const title = document.createElement('h4');
        title.classList.add('title');
        title.textContent = product.title;

        const price = document.createElement('h3');
        price.classList.add('price');
        const priceSpan = document.createElement('span');
        priceSpan.textContent = `US$ ${product.price}`;
        price.appendChild(priceSpan);

        const button = document.createElement('button');
        button.textContent = 'Add to bag';

        // Append elements to the product info div
        infoDiv.appendChild(category);
        infoDiv.appendChild(title);
        infoDiv.appendChild(price);
        infoDiv.appendChild(button);

        // Append picture and info divs to the main product element
        productElement.appendChild(pictureDiv);
        productElement.appendChild(infoDiv);

        // Append the new product element to the container
        container.appendChild(productElement);
    });
}

function heavyOperation(iterations, chunkSize = 1000) {
    return new Promise((resolve) => {
        let i = 0;
        function process() {
            const start = performance.now();
            while (i < iterations && performance.now() - start < 16) {
                // 최대 16ms 동안 작업 수행 (60fps 유지를 위해)
                const temp = Math.sqrt(i) * Math.sqrt(i);
                i++;
            }
            if (i < iterations) {
                requestAnimationFrame(process);
            } else {
                resolve();
            }
        }
        requestAnimationFrame(process);
    });
}

window.onload = () => {
    let status = 'idle';
    let productSection = document.querySelector('#all-products');
    window.onscroll = async () => {
        let position = productSection.getBoundingClientRect().top - (window.scrollY + window.innerHeight);

        if (status === 'idle' && position <= 0) {
            status = 'loading';
            loadProducts();

            try {
                console.time('Heavy operation');
                await heavyOperation(10000000);
                console.timeEnd('Heavy operation');
                console.log("Heavy operation completed");
            } catch (error) {
                console.error("Error in heavy operation:", error);
            }

            status = 'completed';
        }
    }
}
