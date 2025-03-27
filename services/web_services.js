const db = require('../config/dbConnection');
// const { Op } = require('sequelize');

const select_by_values = async (table, conditions) => {
    try {
        const conditionKeys = Object.keys(conditions).map(key => `${key} = ?`).join(' AND ');
        const conditionValues = Object.values(conditions);

        const query = `SELECT * FROM ${table} WHERE ${conditionKeys}`;
        const [result] = await db.execute(query, conditionValues);

        return result;
    } catch (error) {
        console.error('Error in select_by_values:', error.message);
        throw error;
    }
};

const get_total_invoice_value_customer_details = async (select, table, conditions) => {
    try {
        if (!table || !select) {
            throw new Error('Table name and select fields are required.');
        }

        // Ensure conditions are properly formatted
        let whereClause = '';
        let values = [];

        if (conditions && Object.keys(conditions).length > 0) {
            whereClause = 'WHERE ' + Object.keys(conditions).map(key => `${key} = ?`).join(' AND ');
            values = Object.values(conditions);
        }

        // Construct the query properly
        const query = `
            SELECT ${select}
            FROM ${table}
            INNER JOIN shop_invoice_product 
            ON ${table}.shop_invoice_id = shop_invoice_product.shop_invoice_id
            ${whereClause}
        `;

        console.log(query);

        // Execute the query
        const [rows] = await db.execute(query, values);
        return rows;

    } catch (error) {
        console.error('Error in get_total_invoice_value_customer_details:', error.message);
        throw error;
    }
};

const selectAllCount = async (table, whereCondition) => {
    try {
        const count = await table.count({ where: whereCondition });
        return { counts: count };
    } catch (error) {
        console.error("Error fetching count:", error);
        throw error;
    }
};

const selectSumById = async (select, table, condition) => {
    try {
        const result = await table.findAll({
            attributes: [[Sequelize.fn('SUM', Sequelize.col(select)), 'total']],
            where: condition,
            raw: true
        });
        return result;
    } catch (error) {
        console.error("Error fetching sum:", error);
        throw error;
    }
};

const getAll_details_id = async (table, where = {}, order_by = '') => {
    try {
        const options = {
            where: where,
            raw: true
        };
        
        if (order_by) {
            options.order = [[order_by, 'ASC']]; // Change 'ASC' to 'DESC' if needed
        }
        
        const results = await table.findAll(options);
        return results;
    } catch (error) {
        console.error('Error in getAll_details_id:', error.message);
        throw error;
    }
};




module.exports = {
    select_by_values,get_total_invoice_value_customer_details,selectAllCount,selectSumById,getAll_details_id
};
