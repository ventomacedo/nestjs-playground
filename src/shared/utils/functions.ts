export const delay = async (seconds: number) => {
    await new Promise((res) => {
        setTimeout(() => res(true), seconds);
    });
};
