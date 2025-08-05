module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
}
// this function is really stupid and what its doing is taking the passed function, calling it and catching an error if any and 
// passing it to the next function.
// honestly if i open this later and im like what the actual fuck is this, just ignore this and add a try catch everywhere