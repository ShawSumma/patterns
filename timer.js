
export default (() => {
    if (performance.now) {
        return () => performance.now();
    }
    if (performance.webkitNow) {
        return () => performance.webkitNow();
    }
    return () => +new Date();
})();
