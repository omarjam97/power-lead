/**
 * static : sheetName
 * static : header
 * static : fromRow(Array<any>) : Entity;
 *
 */

abstract class Entity {
  abstract toRow(): Array<any>;
}

export default Entity;
