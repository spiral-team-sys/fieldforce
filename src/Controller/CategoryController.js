import { QueryStringSql } from '../Core/SqliteDbContext';
import { products } from '../Core/Table';

const GetDivision = async division => {
  let sql = `SELECT DISTINCT division as code,division as name,false as selected FROM ${products.tableName} 
    WHERE  division IS NOT NULL`;
  if (division !== null) sql += ` AND division='${division}'`;
  const { res } = await QueryStringSql(sql);
  return res || [];
};
const GetCategory = async (division = null) => {
  let sql = `SELECT DISTINCT category as code,categoryName as name ,false as selected
    FROM ${products.tableName} 
    WHERE category IS NOT NULL AND productCode NOT IN('OOS','NOSELL')`;
  if (division !== null) sql += ` AND division='${division}'`;
  sql += ` ORDER BY category`;
  const { res } = await QueryStringSql(sql);
  // console.log(sql, "GetCategory")
  return res || [];
};
const GetSubCate = async (division, category = null) => {
  let sql = `SELECT DISTINCT subCategory as code, subCategory as name,false as selected
    FROM ${products.tableName} 
    WHERE subCatId > 0`;
  if (division !== null) sql += ` AND division='${division}'`;
  if (category !== null) sql += ` AND category='${category}'`;
  sql += ` ORDER BY subCategory`;
  const { res } = await QueryStringSql(sql);
  // console.log(sql, "GetSubCate")
  return res || [];
};
const GetSegment = async (
  division = null,
  category = null,
  subCategory = null,
) => {
  var sql = `SELECT DISTINCT segment as code, segment as name,false as selected FROM ${products.tableName} 
    WHERE segmentId > 0 AND productCode NOT IN('OOS','NOSELL')`;
  if (division !== null) sql += ` AND division='${division}'`;
  if (category !== null) sql += ` AND category='${category}'`;
  if (subCategory !== null) sql += ` AND subCategory='${subCategory}'`;
  sql += ` ORDER BY segment`;
  // console.log(sql, "GetSegment")
  const { res } = await QueryStringSql(sql);
  return res || [];
};
const GetSubSegment = async (
  division = null,
  category = null,
  subCategory = null,
  segment = null,
) => {
  let sql = `SELECT DISTINCT subSegment as code, subSegment as name,false as selected
    FROM ${products.tableName}
    WHERE segmentId > 0 AND productCode NOT IN('OOS','NOSELL')`;
  if (division !== null) sql += ` AND division='${division}'`;
  if (category !== null) sql += ` AND category='${category}'`;
  if (subCategory !== null) sql += ` AND subCategory='${subCategory}'`;
  if (segment !== null) sql += ` AND segment='${segment}'`;
  sql += ` ORDER BY subSegment`;
  const { res } = await QueryStringSql(sql);
  return res || [];
};
const GetProduct = async (
  division = null,
  category = null,
  subCategory = null,
  segment = null,
  subSegment = null,
) => {
  let sql = `SELECT productId as code,(productCode|| productName) as name,false as selected,details
    FROM ${products.tableName}
    WHERE productCode NOT IN('OOS','NOSELL')`;
  if (division !== null) sql += ` AND division='${division}'`;
  if (category !== null) sql += ` AND category='${category}'`;
  if (subCategory !== null) sql += ` AND subCategory='${subCategory}'`;
  if (segment !== null) sql += ` AND segment='${segment}'`;
  if (subSegment !== null) sql += ` AND subSegment='${subSegment}'`;
  sql += ` ORDER BY productCode`;
  // console.log(sql)
  const { res } = await QueryStringSql(sql);
  // console.log(res, "GetProduct")
  return res || [];
};
export const CategoryContext = {
  GetProduct,
  GetDivision,
  GetCategory,
  GetSubCate,
  GetSegment,
  GetSubSegment,
};
