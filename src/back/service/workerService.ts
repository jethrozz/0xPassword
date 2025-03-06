

export function updateConfig(ext_id: string, mk: string){
    chrome.storage.local.set({ [EXTENSION_ID_KEY]: ext_id });
    //chrome.storage.local.set({ [MK_KEY]: message.data.key });
    chrome.storage.session.set({[TEMP_MK]: mk});
}