const bcrypt = require('bcryptjs');

let Print = {
    error: true,
    item_saved: true,
    item_removed: true
};

function Utils() {
    //Callbacks
    this.findByIDCallback = findByIDCallback;
    this.quickSave = quickSave;
    this.quickRemove = quickRemove;
    this.comparePassword = comparePassword;
    this.comparePasswordAsync = comparePasswordAsync;
    this.contains = contains;
    this.returnHash = returnHash;
    this.utc = new Date().toJSON().slice(0,10).replace(/-/g,'/');
    this.time = new Date().toJSON().slice(0,16).replace(/-/g,'/') + "h";
    this.getTime = getTime;
}

let utils = module.exports = exports = new Utils;

/*****************************
 QUICK FUNCS
 *****************************/
/**
 * Saves a DB item, printing custom error messages if needed.
 * @param item
 * @param callback
 * @param type
 */
function quickSave(item, callback, type) {
    item.save(
        function (err, savedItem) {
            savedItemCallback(err, savedItem, callback, type);
        });
}

function getTime()  {
    return new Date().toJSON().slice(0,16).replace(/-/g,'/') + "h";
}
function contains(array, object)    {
    return array.some(e => e === object)
}
/**
 * Removes a DB item, printing custom error messages if needed.
 * @param item
 * @param callback
 * @param type
 */
function quickRemove(item, callback, type) {
    item.remove(function (err, removedItem) {
        removedItemCallback(err, removedItem, callback, type);
    });
}


/*****************************
 CALLBACKS
 *****************************/

/**
 * Callback function for a findByID DB search, printing any errors if needed.
 * @param err
 * @param item
 * @param callback Return callback, invoked with (err, item).
 * @param type
 */
function findByIDCallback(err, item, callback, type) {
    if (err)
        console.error(err);
    else if (!item)
        if (type) {
            if (Print.error) console.error(type + ' >> Find by ID error: NOT FOUND')
        }
        else {
            if (Print.error) console.error('Find by ID error: NOT FOUND')
        }
    callback(err, item);
}

/**
 * Callback function for saving and item in DB, printing errors or success messages.
 * @param err
 * @param createdItem
 * @param callback
 * @param type
 */
function savedItemCallback(err, createdItem, callback, type) {
    if (err)
        console.error(err);
    else if (Print.item_saved) {
        console.log(type + ' ITEM saved with ID: ' + createdItem._id);
    }
    callback(err, createdItem);
}

/**
 * Callback function for saving an item in DB, printing errors or success messages.
 * @param err
 * @param removedItem
 * @param callback
 * @param type
 */
function removedItemCallback(err, removedItem, callback, type) {
    if (err)
        console.error(err);
    else if (Print.item_removed) console.log(type + ' ITEM removed with ID: ' + removedItem._id);
    callback(err, removedItem);
}

function comparePassword(candidatePw, hash, callback) {

    bcrypt.compare(candidatePw, hash, (err, isMatch) => {
        if (err) {
            throw err;
        }
        callback(null, isMatch);

    })
}

async function comparePasswordAsync (candidatePw, pwHash)   {
    return  bcrypt.compare(candidatePw, pwHash)
}

async function returnHash(password)   {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}