var money = 0;
var slimeFields = [];
var slimeIds = [];
var slimeFieldNum = 12;
var mouseClicked = false;
var mouseOverElement = false;
var overTrashCan = false;
var hoveredSlime = -1;
var mouseX = 0;
var mouseY = 0;
var selectedSlime = -1;
var shopItems = [];
var unlockedMaxSlime = 0;
const MAX_SLIME = 10;
const MONEY_CHANGE = [4, 10, 25, 60, 150, 350, 900, 2250, 5500, 14000, 50000]

function reloadContent(){
    document.getElementById("moneyCount").textContent = formatMoneyNumber(money);
}

function createSlimeField(pId){
    let slimeField = document.createElement("div");
    slimeField.classList.add("slimeField");
    slimeField.id = pId;

    let image = document.createElement("img");
    image.src = "assets/slime_standard_0.png";
    image.id = "slimeFieldImage";
    image.animation = "standard";
    image.animationWait = Math.floor(Math.random() * 16);
    image.classList.add("slimeImage");
    image.style.left = "50px";
    image.classList.add("hidden");
    slimeField.addEventListener("mousedown", async function(event){
        while (!mouseClicked) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        selectedSlime = slimeField.id;
        image.classList.add("follower");
         function animate() {

            if(mouseClicked){
                image.style.left = mouseX - (image.width * 0.6);
                image.style.top = mouseY - (image.height * 0.5);
                requestAnimationFrame(animate);
            }else{
                image.classList.remove("follower");
                if(mouseOverElement && hoveredSlime !== slimeField.id){
                    if(slimeIds[hoveredSlime] === -1){
                        showSlime(hoveredSlime, slimeIds[slimeField.id]);
                        removeSlime(slimeField.id);
                    }else{
                        if(slimeIds[hoveredSlime] === slimeIds[slimeField.id]){
                            if(slimeIds[slimeField.id] < MAX_SLIME){
                                mergeSlime(hoveredSlime);
                                removeSlime(slimeField.id);
                            }
                        }
                    }
                }
                if(overTrashCan){
                    removeSlime(slimeField.id);
                }
                selectedSlime = -1;
            }
        }
        
        // Starte die Animation
        animate();
        console.log("test")
    });

    slimeField.addEventListener('mouseout', function() {
        if(hoveredSlime === slimeField.id) mouseOverElement = false;
    });
    slimeField.addEventListener('mouseover', function() {
        mouseOverElement = true;
        hoveredSlime = slimeField.id;
    });
    slimeField.appendChild(image)

    setTimeout(function(){
        setInterval(function(){
            nextAnimation(slimeField.id);
        }, 250);
    }, Math.floor(Math.random() * 1001));

    return slimeField;
}

function nextAnimation(pId){
    if(slimeIds[pId] === -1) return;
    let image = slimeFields[pId].querySelector("img")
    image.animationWait++;
    if(image.animationWait > 15) image.animationWait = 0;
    if(image.animationWait === 0){
        image.animation = "idle";
        money += MONEY_CHANGE[slimeIds[pId]]
        addMoneyCount(pId);
        reloadContent();
    }else{
        image.animation = "standard";
    }
    reloadSlimeImage(pId);
}

function addMoneyCount(pId){
    const slimeField = slimeFields[pId];
    let moneyCount = document.createElement("b");
    moneyCount.textContent = "+" + formatMoneyNumber(MONEY_CHANGE[slimeIds[pId]]) + "$"
    moneyCount.classList.add("moneyCount");
    moneyCount.classList.add("noUserSelect");
    window.getSelection().removeAllRanges()
    moneyCount.addEventListener('animationend', () => {
        moneyCount.remove();
    });
    slimeField.appendChild(moneyCount);
}

document.addEventListener('click', function(event) {
    mouseClicked = false;
    selectedSlime = -1;
});

document.addEventListener('mousedown', function(event) {
    mouseClicked = true;
});

document.addEventListener('mousemove', handleMouseMovement);
function handleMouseMovement(event) {
    mouseX = event.clientX;
    mouseY = event.clientY;
}

function removeSlime(pId){
    slimeFields[pId].querySelector("img").classList.add("hidden");
    slimeIds[pId] = -1;
}

function showSlime(pId, pSlimeId){
    let image = slimeFields[pId].querySelector("img")
    window.getSelection().removeAllRanges()
    image.classList.remove("hidden");
    slimeIds[pId] = pSlimeId;
    reloadSlimeImage(pId);
}

function createSlime(pId){
    for(let i = 0; i < slimeFieldNum ; i++){
        if(slimeIds[i] === -1) {
            showSlime(i, pId)
            return true;
        }
    }
    return false;
}

function mergeSlime(pId){
    slimeIds[pId]++;
    reloadSlimeImage(pId);

    let mergedSlimeNum = slimeIds[pId];
    //if(mergedSlimeNum === MAX_SLIME) return;
    if(!shopItems[mergedSlimeNum].unlocked) {
        unlockedMaxSlime = mergedSlimeNum;
        unlockShopItem(mergedSlimeNum);
        showMessage(mergedSlimeNum);
    }
}

function reloadSlimeImage(pId){
    let image = slimeFields[pId].querySelector("img")
    image.src = "assets/slime_" + slimeIds[pId] + "_" + image.animation + ".png";
}

function costSlime(pId){
    return (MONEY_CHANGE[pId] * 25);
}

function createShopElement(pId){
    let button = document.createElement("button");
    button.unlocked = false;
    button.classList.add("shopItem");
    button.onclick = function(){
        if(button.unlocked && money >= costSlime(pId)){
            if(createSlime(pId)) money -= costSlime(pId);
            reloadContent();
        }
    };

    let image = document.createElement("img");
    image.src = "assets/lock.png";
    image.classList.add("slimeImage");
    image.classList.add("lock");
    button.appendChild(image);

    let prize = document.createElement("p");
    prize.textContent = costSlime(pId) + "$";
    button.appendChild(prize);
    return button;
}

function unlockShopItem(pId){
    if(pId > MAX_SLIME) return;
    let shopItem = shopItems[pId];
    shopItem.unlocked = true;
    let image = shopItem.querySelector("img");
    image.src = "assets/slime_" + pId + "_standard.png";
}

function formatMoneyNumber(pMoney){
    if(pMoney < 1000) return Math.floor(pMoney);
    pMoney /= 1000;
    if(pMoney < 1000) return Math.floor(pMoney * 10) / 10 + "k";
    pMoney /= 1000;
    if(pMoney < 1000) return Math.floor(pMoney * 10) / 10 + "m";
    pMoney /= 1000;
    if(pMoney < 1000) return Math.floor(pMoney * 10) / 10 + "b";
    return Math.floor(pMoney) + "b";
}

function doShopStuff(){
    let shopContainer = document.getElementById("shopContainer");
    if(shopContainer.visible){
        shopContainer.classList.add("hidden");
    }else{
        shopContainer.classList.remove("hidden");
    }
    shopContainer.visible = !shopContainer.visible;
}

let audio = document.getElementById('backgroundMusic');
let intervalId;

function startMusicLoop() {
    intervalId = setInterval(() => {
        audio.play();
    },0); 
}

function stopLoop() {
    clearInterval(intervalId);
    audio.pause();
    audio.currentTime = 0;
}

function makeMessage(){
    let messageContainer = document.getElementById("messageContainer");
    messageContainer.shown = true;
    messageContainer.classList.add("noUserSelect");

    let background = document.createElement("img");
    background.src = "assets/sunburst.svg";
    background.id = "messageBackground";
    background.classList.add("messageItem");
    background.classList.add("messageBackground");

    let slimeBackground = document.createElement("img");
    slimeBackground.src = "assets/spinBackground.svg";
    slimeBackground.id = "messageSlimeBackground";
    slimeBackground.classList.add("messageItem");
    slimeBackground.classList.add("messageSlimeBackground");

    let newText = document.createElement("span");
    newText.textContent = "new slime unlocked!";
    newText.classList.add("messageItem");
    newText.classList.add("messageUnlock");

    let costText = document.createElement("p");
    costText.textContent = "Cost: $100B";
    costText.classList.add("messageItem")
    costText.classList.add("messageCost");
    costText.id = "messageCostText";

    let moneyText = document.createElement("p");
    moneyText.textContent = "Earnings: $100";
    moneyText.classList.add("messageItem");
    moneyText.classList.add("messageEarnings");
    moneyText.id = "messageMoneyText";

    let slimeImage = document.createElement("img");
    slimeImage.src = "assets/slime_0_standard.png";
    slimeImage.classList.add("messageItem");
    slimeImage.classList.add("messageImage");
    slimeImage.id = "messageImage";

    let description = document.createElement("p");
    description.textContent = "Look! another cute guy appeared!"
    description.classList.add("messageItem");
    description.classList.add("messageDescription");

    let continueText = document.createElement("p");
    description.textContent = "-click anywhere to continue-"
    description.classList.add("messageItem");
    description.classList.add("messageContinue");

    messageContainer.appendChild(background);
    messageContainer.appendChild(slimeBackground)
    messageContainer.appendChild(newText);
    messageContainer.appendChild(costText);
    messageContainer.appendChild(moneyText);
    messageContainer.appendChild(slimeImage);
    messageContainer.appendChild(description);

    hideMessage();
}

function showMessage(pSlimeId){
    window.scrollTo(0, 0);
    disableScroll();

    let image = document.getElementById("messageImage");
    image.src = "assets/slime_" + pSlimeId +  "_standard.png";

    let costText = document.getElementById("messageCostText");
    costText.textContent = "Costs: $" + formatMoneyNumber(costSlime(pSlimeId))

    let earningsText = document.getElementById("messageMoneyText");
    earningsText.textContent = "Earnings: $" + formatMoneyNumber(MONEY_CHANGE[pSlimeId])

    let messageContainer = document.getElementById("messageContainer");
    messageContainer.classList.remove("hidden");
    messageContainer.shown = true;
    reloadMessageContent();
}
function hideMessage(){
    let messageContainer = document.getElementById("messageContainer");
    messageContainer.classList.add("hidden");
    messageContainer.shown = false;
    //enableScroll();
}

window.addEventListener('resize', function() {
    reloadMessageContent();
});
window.addEventListener("scroll", function() {
    //window.scrollTo(0, 0);
});

window.addEventListener("click", function(){
    let messageContainer = document.getElementById("messageContainer");
    if(messageContainer.shown){
        hideMessage();
    }
});

function disableScroll() {
    document.body.style.overflow = 'hidden';
}

// Funktion zum Aktivieren des Scrollens
function enableScroll() {
    document.body.style.overflow = '';
}

function reloadMessageContent(){
    let messageContainer = document.getElementById("messageContainer");
    if(messageContainer.shown){
        let backgroundMessage = document.getElementById("messageBackground");
        let size = Math.max(window.innerWidth, window.innerHeight) * 1.5;
        backgroundMessage.style.height = size + "px";
        backgroundMessage.style.left = ((0.5 * this.window.innerWidth) - size/2) + "px";
    }
}

const trashIcon = document.getElementById("trashCan");

trashIcon.addEventListener('mouseover', function() {
    if(selectedSlime !== -1) {
        overTrashCan = true;
        this.src = "assets/trash_open.png";
    }
});

trashIcon.addEventListener('mouseout', function() {
    overTrashCan = false;
    this.src = "assets/trash.png";
});

//create a few slimes
setInterval(function(){
    if(Math.floor(Math.random() * 3) === 0){
        let messageContainer = document.getElementById("messageContainer");
        if(!messageContainer.shown) createSlime(Math.floor(Math.random() * unlockedMaxSlime));
    }
}, 1500);

//when window resized do some stuff
window.addEventListener("resize", () =>{
    //resize background
    //resize sky
    let skyBackground = document.getElementById("backgroundSkyImage");
    
});

//initialize shop
for(let i = 0; i < MAX_SLIME + 1; i++){
    let shopContainer = document.getElementById("shopContainer");
    let shopElement = createShopElement(i);
    shopContainer.appendChild(shopElement);
    shopItems[i] = shopElement;
}
let shopContainer = document.getElementById("shopContainer");
shopContainer.classList.add("hidden");
shopContainer.open = false;

//initialize slimes
for(let i = 0; i < slimeFieldNum; i++){
    let container = document.getElementById("slimeContainer");
    let slimeField = createSlimeField(i);
    container.appendChild(slimeField);
    slimeFields[i] = slimeField;
    slimeIds[i] = -1;
}

reloadContent();
showSlime(0, 0);
unlockShopItem(0);
startMusicLoop();
makeMessage();
disableScroll();


