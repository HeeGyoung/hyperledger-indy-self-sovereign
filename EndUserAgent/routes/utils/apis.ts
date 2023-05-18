import fetch from 'node-fetch'

export const request = async (url: string, config: RequestInit={}) => {
    // @ts-ignore
    const response= await fetch(url, config)
    return await response.json()
}

export const getGenesisTransaction = async (url: string) => {
    // Legacy code has a small issue with the call-signature from node-fetch
    // @ts-ignore
    const response = await fetch(url)
    return await response.text()
}
