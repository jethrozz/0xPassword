
//监听当前网页的所有的input框
// 监听所有 input 框
function listenToInputs() {
    // 获取页面上所有的 input 元素
    const inputs = document.getElementsByTagName('input');
    // 遍历所有 input 元素
    for (let input of inputs) {
        // 判断是否是用户名输入框
        if (isUsernameField(input)) {
            console.log('找到用户名输入框:', input);
            // 监听输入事件
            input.addEventListener('input', (e) => {
                console.log('用户名输入:', e.target.value);
            });
        }
        
        // 判断是否是密码输入框
        if (isPasswordField(input)) {
            console.log('找到密码输入框:', input);
            // 监听输入事件
            input.addEventListener('input', (e) => {
                console.log('密码输入:', e.target.value);
            });
        }
    }
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

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', listenToInputs);
// 创建 MutationObserver 实例
const observer = new MutationObserver((mutations) => {
    // 当 DOM 发生变化时，调用 listenToInputs 函数
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