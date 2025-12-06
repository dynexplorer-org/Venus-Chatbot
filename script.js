// === robot 動態 start ===
// 圖層配置
const layers = [
	{
		id: "hair",
		initialOffset: { x: 0, y: -18 },
		maxOffset: 4,
		reverse: true
	},
	{
		id: "head",
		initialOffset: { x: 0, y: 4 },
		maxOffset: 4
	},
	{
		id: "face",
		initialOffset: { x: 0, y: 7 },
		maxOffset: 8
	},
	{
		id: "expression",
		initialOffset: { x: 0, y: 7 },
		maxOffset: 12
	}
].map((layer) => ({
	...layer, // 把上面所有屬性攤開
	element: document.getElementById(layer.id)
}));

// 容器元素
const container = document.getElementById("chatbot");

// 快取容器位置和最大距離
let containerRect = container.getBoundingClientRect();
let maxDistance =
	Math.sqrt(window.innerWidth ** 2 + window.innerHeight ** 2) / 2;

// 滑鼠位置
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

// 初始化圖層位置
layers.forEach((layer) => {
	const { x, y } = layer.initialOffset;
	layer.element.style.setProperty("--offset-x", `${x}px`);
	layer.element.style.setProperty("--offset-y", `${y}px`);
});

// 更新視差效果
function updateParallax() {
	const centerX = containerRect.left + containerRect.width / 2;
	const centerY = containerRect.top + containerRect.height / 2;

	const dx = mouseX - centerX;
	const dy = mouseY - centerY;
	const distance = Math.sqrt(dx * dx + dy * dy);

	if (distance === 0) return;

	const influence = Math.min(distance / maxDistance, 1);
	const dirX = dx / distance;
	const dirY = dy / distance;

	layers.forEach((layer) => {
		const { x: initialX, y: initialY } = layer.initialOffset;
		const factor = layer.reverse ? -1 : 1;
		const offsetX = dirX * layer.maxOffset * influence * factor;
		const offsetY = dirY * layer.maxOffset * influence * factor;

		layer.element.style.setProperty("--offset-x", `${initialX + offsetX}px`);
		layer.element.style.setProperty("--offset-y", `${initialY + offsetY}px`);
	});
}

// 轉頭動畫循環
function rotate_animate() {
	updateParallax();
	requestAnimationFrame(rotate_animate);
}

// 監聽滑鼠移動
document.addEventListener("mousemove", (e) => {
	mouseX = e.clientX;
	mouseY = e.clientY;
});

// 視窗大小變化時更新快取
window.addEventListener("resize", () => {
	containerRect = container.getBoundingClientRect();
	maxDistance = Math.sqrt(window.innerWidth ** 2 + window.innerHeight ** 2) / 2;
});

// 啟動轉頭
rotate_animate();

// 眨眼功能參數
const blink_config = {
	minInterval: 5000, // 最短間隔時間 (毫秒)
	maxInterval: 10000, // 最長間隔時間 (毫秒)
	closeSpeed: 100, // 閉眼速度 (毫秒，越小越快)
	closedDuration: 150, // 閉眼停留時間 (毫秒)
	openSpeed: 150 // 睜眼速度 (毫秒，越小越快)
};

const leftEye = document.getElementById("eye-l");
const rightEye = document.getElementById("eye-r");

// 眨眼動作（使用 scaleY 壓縮）
function blink() {
	// 取得眼睛中心點
	const leftBox = leftEye.getBBox();
	const rightBox = rightEye.getBBox();
	const leftCenterY = leftBox.y + leftBox.height / 2;
	const rightCenterY = rightBox.y + rightBox.height / 2;

	// 設定 transform origin 到眼睛中心
	leftEye.style.transformOrigin = `${
		leftBox.x + leftBox.width / 2
	}px ${leftCenterY}px`;
	rightEye.style.transformOrigin = `${
		rightBox.x + rightBox.width / 2
	}px ${rightCenterY}px`;

	// 閉眼（垂直壓縮到 10%）
	leftEye.style.transition = `transform ${blink_config.closeSpeed}ms ease-out`;
	rightEye.style.transition = `transform ${blink_config.closeSpeed}ms ease-out`;
	leftEye.style.transform = "scaleY(0.1)";
	rightEye.style.transform = "scaleY(0.1)";

	// 停留後睜眼
	setTimeout(() => {
		leftEye.style.transition = `transform ${blink_config.openSpeed}ms ease-out`;
		rightEye.style.transition = `transform ${blink_config.openSpeed}ms ease-out`;
		leftEye.style.transform = "scaleY(1)";
		rightEye.style.transform = "scaleY(1)";
	}, blink_config.closeSpeed + blink_config.closedDuration);
}

// 隨機眨眼循環
function blink_animate() {
	const randomDelay =
		Math.random() * (blink_config.maxInterval - blink_config.minInterval) +
		blink_config.minInterval;
	setTimeout(() => {
		blink();
		blink_animate();
	}, randomDelay);
}

// 啟動眨眼
blink_animate();
// === robot 動態 end ===




// AI 回應訊息庫 - 隨機抽取用於模擬對話
const aiResponses = [
	"您好,有什麼想了解的?",
	"這款商品很受歡迎喔!",
	"我幫您看看有沒有現貨~",
	"感謝您的詢問,我很樂意為您服務!",
	"這個問題讓我想想... 🤔",
	"我們有提供多種付款方式供您選擇!",
	"如需更多資訊,我隨時都在這裡!",
	"好的,我了解您的需求了!",
	"小豆找到以下相關答案,若不是您想問的,請換個問法試試",
	"我們的客服團隊會盡快協助您!"
];

// 全域變數
let chatHistory = []; // 儲存聊天歷史記錄
let isExpanded = false; // 聊天視窗是否為展開狀態
let lastMessageType = null; // 記錄上一則訊息類型(user/ai),用於判斷是否為連續訊息

// DOM 元素選取
const chatButton = document.getElementById("chatbot"); // 聊天機器人按鈕
const greetingBubble = document.getElementById("greetingBubble"); // 問候語泡泡
const chatWindow = document.getElementById("chatWindow"); // 聊天視窗
const expandButton = document.getElementById("expandButton"); // 展開/縮小按鈕
const closeButton = document.getElementById("closeButton"); // 關閉按鈕
const chatMessages = document.getElementById("chatMessages"); // 訊息顯示區域
const chatInput = document.getElementById("chatInput"); // 訊息輸入框
const sendButton = document.getElementById("sendButton"); // 發送按鈕

/**
 * 儲存訊息到歷史記錄
 * @param {string} text - 訊息內容
 * @param {string} type - 訊息類型 (user/ai)
 */
function saveMessage(text, type) {
	chatHistory.push({ text, type, timestamp: Date.now() });
}

/**
 * 將訊息添加到 UI 介面
 * @param {string} text - 訊息內容
 * @param {string} type - 訊息類型 (user/ai)
 * @param {boolean} shouldSave - 是否儲存到歷史記錄,預設為 true
 */
function addMessageToUI(text, type, shouldSave = true) {
	// 創建訊息容器
	const messageDiv = document.createElement("div");
	messageDiv.className = `message ${type}`;

	// 檢查是否為連續的 AI 訊息,若是則添加 grouped 樣式(用於調整間距)
	if (type === "ai" && lastMessageType === "ai") {
		messageDiv.classList.add("grouped");
	}

	// 如果是 AI 訊息,添加頭像
	if (type === "ai") {
		const avatarDiv = document.createElement("div");
		// avatarDiv.textContent = "AI"; // 顯示名字
		avatarDiv.className = "ai-avatar"; // 顯示頭像
		messageDiv.appendChild(avatarDiv);
	}

	// 創建訊息泡泡並添加文字內容
	const bubbleDiv = document.createElement("div");
	bubbleDiv.className = "message-bubble";
	bubbleDiv.textContent = text;
	messageDiv.appendChild(bubbleDiv);
	chatMessages.appendChild(messageDiv);

	// 更新最後訊息類型
	lastMessageType = type;

	// 根據參數決定是否儲存到歷史記錄
	if (shouldSave) {
		saveMessage(text, type);
	}
	
	// 捲動至底部以顯示最新訊息
	scrollToBottom();
}

/* 顯示 AI思考輸入中 動畫 */
function showTypingIndicator() {
	const typingDiv = document.createElement("div");
	typingDiv.className = "message ai";
	typingDiv.id = "typingIndicator"; // 設定 ID 方便後續移除

	// 檢查是否為連續的 AI 訊息
	if (lastMessageType === "ai") {
		typingDiv.classList.add("grouped");
	}

	// 添加 AI 頭像
	const avatarDiv = document.createElement("div");
	avatarDiv.className = "ai-avatar";
	avatarDiv.textContent = "AI";
	typingDiv.appendChild(avatarDiv);

	// 創建包含三個動畫點的泡泡
	const bubbleDiv = document.createElement("div");
	bubbleDiv.className = "message-bubble";
	const indicator = document.createElement("div");
	indicator.className = "typing-indicator";
	indicator.innerHTML = "<span></span><span></span><span></span>";
	bubbleDiv.appendChild(indicator);
	typingDiv.appendChild(bubbleDiv);
	chatMessages.appendChild(typingDiv);
	scrollToBottom();
}

/* 移除 AI思考輸入中 動畫 */
function removeTypingIndicator() {
	const typingIndicator = document.getElementById("typingIndicator");
	if (typingIndicator) {
		typingIndicator.remove();
	}
}

/*
 * 隨機獲取 1-3 條 AI 回應訊息
 * @returns {Array} 隨機選取的回應訊息陣列
 */
function getRandomAIResponses() {
	const count = Math.floor(Math.random() * 3) + 1; // 隨機 1-3 條
	const shuffled = [...aiResponses].sort(() => 0.5 - Math.random()); // 打亂順序
	return shuffled.slice(0, count); // 取前 count 條
}

/* 功能選單卡片 */
// function showMenuCards() {
// 	// 定義卡片資料
// 	const cardsData = [
// 		{
// 			title: "產品資訊",
// 			icon: "🛍️",
// 			items: ["查看商品目錄", "最新優惠", "熱門商品", "產品規格"]
// 		},
// 		{
// 			title: "訂單查詢",
// 			icon: "📦",
// 			items: ["查詢訂單", "物流追蹤", "退換貨服務", "訂單歷史"]
// 		},
// 		{
// 			title: "客戶服務",
// 			icon: "💬",
// 			items: ["聯絡客服", "常見問題", "使用教學", "意見反饋"]
// 		},
// 		{
// 			title: "會員中心",
// 			icon: "👤",
// 			items: ["會員資訊", "優惠券", "積分查詢", "等級權益"]
// 		}
// 	];

// 	// 創建外層包裝容器
// 	const wrapperDiv = document.createElement("div");
// 	wrapperDiv.className = "menu-cards-wrapper";

// 	// 創建左側捲動按鈕
// 	const leftButton = document.createElement("button");
// 	leftButton.className = "scroll-button left-button";
// 	leftButton.innerHTML = '<svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>';

// 	// 創建卡片容器(可橫向捲動)
// 	const containerDiv = document.createElement("div");
// 	containerDiv.className = "menu-cards-container";

// 	// 迴圈生成每張卡片
// 	cardsData.forEach(cardData => {
// 		const cardDiv = document.createElement("div");
// 		cardDiv.className = "card";

// 		// 卡片標題(圖示 + 文字)
// 		const titleDiv = document.createElement("div");
// 		titleDiv.className = "title";
// 		titleDiv.innerHTML = `<span class="card-title-img">${cardData.icon}</span><span>${cardData.title}</span>`;
// 		cardDiv.appendChild(titleDiv);

// 		// 卡片內的選項按鈕
// 		cardData.items.forEach(item => {
// 			const buttonDiv = document.createElement("div");
// 			buttonDiv.className = "card-button";
// 			buttonDiv.innerHTML = `<span><a href="#">${item}</a></span>`;
			
// 			// 點擊按鈕時自動填入輸入框並發送
// 			buttonDiv.addEventListener("click", (e) => {
// 				e.preventDefault();
// 				chatInput.value = item;
// 				sendMessage();
// 			});
// 			cardDiv.appendChild(buttonDiv);
// 		});

// 		containerDiv.appendChild(cardDiv);
// 	});

// 	// 創建右側捲動按鈕
// 	const rightButton = document.createElement("button");
// 	rightButton.className = "scroll-button right-button";
// 	rightButton.innerHTML = '<svg viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>';

// 	// 組裝元素
// 	wrapperDiv.appendChild(leftButton);
// 	wrapperDiv.appendChild(containerDiv);
// 	wrapperDiv.appendChild(rightButton);
// 	chatMessages.appendChild(wrapperDiv);

// 	/**
// 	 * 檢查捲動狀態並顯示/隱藏左右按鈕
// 	 */
// 	function checkScroll() {
// 		const isScrollable = containerDiv.scrollWidth > containerDiv.clientWidth; // 內容是否可捲動
// 		const isAtStart = containerDiv.scrollLeft <= 0; // 是否在最左邊
// 		const isAtEnd = containerDiv.scrollLeft >= containerDiv.scrollWidth - containerDiv.clientWidth - 5; // 是否在最右邊

// 		// 只有當內容可捲動時才顯示按鈕
// 		if (isScrollable) {
// 			leftButton.classList.toggle("visible", !isAtStart); // 不在最左邊時顯示左按鈕
// 			rightButton.classList.toggle("visible", !isAtEnd); // 不在最右邊時顯示右按鈕
// 		}
// 	}

// 	// 左按鈕點擊事件:向左捲動 220px
// 	leftButton.addEventListener("click", () => {
// 		containerDiv.scrollLeft -= 220;
// 		setTimeout(checkScroll, 300); // 等待捲動動畫完成後檢查狀態
// 	});

// 	// 右按鈕點擊事件:向右捲動 220px
// 	rightButton.addEventListener("click", () => {
// 		containerDiv.scrollLeft += 220;
// 		setTimeout(checkScroll, 300);
// 	});

// 	// 監聽捲動事件以即時更新按鈕狀態
// 	containerDiv.addEventListener("scroll", checkScroll);
	
// 	// 初始化時檢查一次捲動狀態
// 	setTimeout(checkScroll, 100);
// 	scrollToBottom();
// }

/*
 * 發送訊息的核心函式
 * 處理使用者輸入,並模擬 AI 回應
 */
function sendMessage() {
	const message = chatInput.value.trim();
	if (message === "") return; // 空訊息不處理

	// 顯示使用者訊息
	addMessageToUI(message, "user");
	chatInput.value = ""; // 清空輸入框

	// 獲取隨機 AI 回應
	const responses = getRandomAIResponses();
	let delay = 800; // 初始延遲時間

	// 依序顯示多條 AI 回應,每條之間有延遲和「輸入中」動畫
	responses.forEach((response, index) => {
		setTimeout(() => {
			// 移除舊的輸入中動畫
			removeTypingIndicator();

			// 顯示 AI 回覆
			addMessageToUI(response, "ai");

			// 如果不是最後一句,顯示「輸入中」動畫
			if (index < responses.length - 1) {
				setTimeout(() => {
					showTypingIndicator();
				}, 200);
			}
		}, delay);
		
		// 累加延遲時間,讓每條回應間隔自然
		delay += 1200 + Math.random() * 600; // 1200-1800ms 隨機間隔
	});
}

/*
 * 捲動至訊息區域底部
 * 確保使用者看到最新訊息
 */
function scrollToBottom() {
	chatMessages.scrollTop = chatMessages.scrollHeight;
}

/*
 * 更新展開/縮小按鈕的圖示
 * 根據當前狀態切換不同的 SVG 圖示
 */
function updateExpandButton() {
	if (isExpanded) {
		// 展開狀態 顯示縮小圖示
		expandButton.innerHTML = '<svg viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>';
	} else {
		// 縮小狀態 顯示展開圖示
		expandButton.innerHTML = '<svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>';
	}
}

/*
 * 聊天機器人按鈕點擊事件
 * 開啟聊天視窗並顯示歡迎訊息與選單
 */
chatButton.addEventListener("click", () => {
	chatWindow.classList.add("active"); // 顯示聊天視窗
	chatButton.classList.add("hidden"); // 隱藏聊天按鈕
	greetingBubble.classList.remove("show"); // 隱藏問候語泡泡

	// 如果是首次開啟,顯示歡迎訊息和選單卡片
	if (chatHistory.length === 0) {
		setTimeout(() => {
			// 顯示歡迎訊息
			addMessageToUI("Hello! I am AI intelligent assistant, I am happy to serve you!", "ai");
			
			// 延遲顯示選單卡片
			setTimeout(() => {
				showMenuCards();
				lastMessageType = null; // 重置,讓選單卡片後的對話不會被視為連續訊息
			}, 500);
		}, 300);
	}
});

/*
 * 關閉按鈕點擊事件
 * 關閉聊天視窗並重置狀態
 */
closeButton.addEventListener("click", () => {
	chatWindow.classList.remove("active"); // 隱藏聊天視窗
	chatWindow.classList.remove("expanded"); // 移除展開狀態
	chatButton.classList.remove("hidden"); // 顯示聊天按鈕
	isExpanded = false; // 重置展開狀態
	updateExpandButton(); // 更新按鈕圖示
});

/* 展開/縮小切換聊天視窗大小 */
expandButton.addEventListener("click", () => {
	isExpanded = !isExpanded; // 切換狀態
	chatWindow.classList.toggle("expanded", isExpanded); // 切換樣式類別
	updateExpandButton(); // 更新按鈕圖示
	setTimeout(scrollToBottom, 100); // 重新調整後捲動至底部
});

/* 發送按鈕點擊事件 */
sendButton.addEventListener("click", sendMessage);

/* 按下 Enter 鍵即發送訊息 */
chatInput.addEventListener("keypress", (e) => {
	if (e.key === "Enter") {
		sendMessage();
	}
});