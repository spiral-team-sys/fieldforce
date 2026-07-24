import { QueryStringSql } from '../Core/SqliteDbContext';
import { products } from '../Core/Table';
import { AppNameBuild, mitsuApp, _competitorId } from '../Core/URLs';

export async function getCompetitorSO() {
  const sql =
    'Select type as id,division as name' +
    ' FROM products WHERE division IS NOT NULL' +
    (AppNameBuild === mitsuApp || AppNameBuild === 'lg'
      ? ' AND type=' + _competitorId
      : '') +
    ' GROUP BY type';
  const { res } = await QueryStringSql(sql);
  return res || [];
}
export async function getCategorySO() {
  const sql = `SELECT DISTINCT categoryId as id,category as name,division
         FROM ${products.tableName} WHERE categoryId != 123`;
  const { res } = await QueryStringSql(sql);
  return res || [];
}
export const getSubCategorySO = async () => {
  const sql = `SELECT DISTINCT subCatId as id,subCategory as name,category,division
                FROM ${products.tableName} WHERE categoryId != 123`;
  const { res } = await QueryStringSql(sql);
  return res || [];
};
export async function getSegmentSO() {
  const sql = `SELECT DISTINCT segmentId as id,segment as name,category,subcategory,division
            FROM ${products.tableName} WHERE segmentId IS NOT NULL AND categoryId != 123`;
  const { res } = await QueryStringSql(sql);
  return res || [];
}
export async function getSubSegmentSO() {
  const sql = `SELECT DISTINCT subSegmentId as id,subSegment as name,segment,subcategory,category
                FROM ${products.tableName} WHERE subSegmentId IS NOT NULL AND categoryId != 123`;
  const { res } = await QueryStringSql(sql);
  return res || [];
}
export async function getProductSO(competitorId) {
  const sql = `SELECT productId,productId as id,productName as name,productName,productName as products,productCode,division,category,subcategory,segment,subsegment, price
            FROM ${products.tableName} WHERE categoryId != 123 AND type = ${competitorId}
            ORDER BY categoryId,subCatId,segmentId`;
  const { res } = await QueryStringSql(sql);
  return res || [];
}
export async function getNOSELLSO() {
  const sql = `Select productId FROM ${products.tableName} WHERE productCode='NOSELL'`;
  const { res } = await QueryStringSql(sql);
  return res || [];
}
export async function getCategoryPromotion() {
  const sql =
    'Select categoryId as id,categoryName as name' +
    " FROM products WHERE productCode not in ('OOS','NOSELL') " +
    ' GROUP BY categoryId';
  const { res } = await QueryStringSql(sql);
  return res || [];
}
export const CountProduct = async () => {
  const { res } = await QueryStringSql(
    `SELECT COUNT(*) as totalProduct FROM ${products.tableName}`,
  );
  return res != undefined && res !== null && res.length > 0
    ? res[0].totalProduct
    : 0;
};

export const getAllProduct = async () => {
  const sql = `SELECT * FROM ${products.tableName} 
    WHERE productCode not in ('OOS','NOSELL')
    ORDER BY type,categoryId, productName `;
  const { res } = await QueryStringSql(sql);
  return res || [];
};
export const getProductByType = async type => {
  const sql = `SELECT *,productId as id,productName as name FROM ${products.tableName} 
    WHERE productCode not in ('OOS','NOSELL') AND type = ${type}
    ORDER BY categoryId, productName `;
  const { res } = await QueryStringSql(sql);
  return res || [];
};
