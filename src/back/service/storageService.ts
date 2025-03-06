//


// 创建带Promise封装的storage访问
export const getLocalStorage = (key: string): Promise<any> => {
    return new Promise(resolve => {
        chrome.storage.local.get([key], result => resolve(result[key]));
    });
};
export const getSessionStorage = (key: string): Promise<any> => {
    return new Promise(resolve => {
        chrome.storage.session.get([key], result => resolve(result[key]));
    });
};