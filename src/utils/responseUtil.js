function adjustDateByDays(date, days) {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);

    const year = newDate.getUTCFullYear();
    const month = String(newDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(newDate.getUTCDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

const mergeArrayWithoutDuplicates = (arr1, arr2) => {
    const mergedMap = new Map();

    const addDataToMap = (data) => {
        data.forEach(item => {
            const uniqueKey = `${item.name}-${item.neo_reference_id}-${item.close_approach_data[0].close_approach_date_full}`;
            mergedMap.set(uniqueKey, item);
        });
    };

    addDataToMap(arr1);
    addDataToMap(arr2);

    return Array.from(mergedMap.values());
};

module.exports = {
    adjustDateByDays,
    mergeArrayWithoutDuplicates,
};