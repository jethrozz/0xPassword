
//监听当前网页的所有的input框
// 监听所有 input 框
var username = '';
var password = '';
let usernameInput = null;
let passwordInput = null;
let port = null;
function listenToInputs() {
    console.log('listenToInputs');
    // 获取页面上所有的 input 元素
    const inputs = document.getElementsByTagName('input');
    if (inputs.length === 0) {
        console.log('没有找到 input 元素');
        const frames = document.querySelectorAll('iframe');
        //获取iframe中的input元素
        frames.forEach(frame => {
            try {
                // 确保同源策略允许访问
                const frameDoc = frame.contentDocument || frame.contentWindow.document;
                processInputs(frameDoc); // 处理iframe内的input
            } catch (e) {
                console.warn('无法访问iframe文档:', e);
            }
        });
    }
    // 处理主文档的input
    processInputs(document);
}

function processInputs(rootDocument) {
    const inputs = rootDocument.querySelectorAll('input');
    const submitButtons = rootDocument.querySelectorAll('button, input[type="submit"], input[type="button"]');

    // 遍历所有 input 元素
    for (let input of inputs) {
        // 判断是否是用户名输入框
        if (isUsernameField(input)) {
            console.log('找到用户名输入框:', input);
            usernameInput = input;
            // 监听输入事件
            input.addEventListener('input', (e) => {
                console.log('用户名输入:', e.target.value);
            });
        }

        // 判断是否是密码输入框
        if (isPasswordField(input)) {
            console.log('找到密码输入框:', input);
            passwordInput = input;
            // 监听输入事件
            input.addEventListener('input', (e) => {
                console.log('密码输入:', e.target.value);
            });
        }
    }

    // 监听按钮点击事件
    submitButtons.forEach(button => {
        if (isSubmitButton(button)) {
            console.log('找到提交按钮:', button);
            button.addEventListener('click', (e) => {
                console.log('提交按钮被点击', e.target);
                // 这里可以获取关联的输入框数据
                //获取当前的url
                let url = window.location.href;
                let usernameNew = usernameInput.value;
                let passwordNew = passwordInput.value;
                
                if(usernameNew != username || passwordNew != password) {
                    username = usernameNew;
                    password = passwordNew;
                    port.postMessage({
                        username: usernameNew,
                        password: passwordNew,
                        url: url
                    });
                }
            });
        }
    });
}
// 新增判断提交按钮的方法
function isSubmitButton(element) {
    const buttonIdentifiers = ['submit', 'confirm', 'login', 'signin'];
    const buttonTexts = ['登录', 'login'];
    const elementId = element.id.toLowerCase();
    const elementType = element.type.toLowerCase();
    const buttonText = element.textContent.toLowerCase();

    return elementType === 'submit' ||
        buttonIdentifiers.some(id => elementId.includes(id)) ||
        element.textContent.toLowerCase().includes('submit') ||
        buttonTexts.some(text => buttonText.includes(text));
}
// 判断是否是用户名输入框
function isUsernameField(input) {
    const usernameIdentifiers = ['username', 'user', 'email', 'account', 'login'];
    const inputType = input.type.toLowerCase();
    const inputId = input.id.toLowerCase();
    const inputName = input.name.toLowerCase();

    return (
        (inputType === 'text' || inputType === 'email') &&
        (usernameIdentifiers.some(id => inputId.includes(id)) ||
            usernameIdentifiers.some(id => inputName.includes(id)))
    );
}

// 判断是否是密码输入框
function isPasswordField(input) {
    return input.type.toLowerCase() === 'password';
}

port = chrome.runtime.connect({name: "password-save"});
port.onMessage.addListener(function(msg) {
    console.log('msg', msg);
});
// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', listenToInputs);
// 创建 MutationObserver 实例
const observer = new MutationObserver((mutations) => {
    // 当 DOM 发生变化时，调用 listenToInputs 函数
    console.log('DOM 发生变化');
    listenToInputs();
});

// 配置 MutationObserver 的观察选项
const config = {
    childList: true, // 监听子节点的变化
    subtree: true,  // 监听子树的变化
    attributes: true, // 监听属性的变化
};

// 开始观察 document.body 的变化
observer.observe(document.body, config);


