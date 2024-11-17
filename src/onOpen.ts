import { ProductMenu } from "./Entities/Products/Product";
import { StoresMenu } from "./Entities/Stores";

const MENUS = [ProductMenu,StoresMenu];

function onOpen(e) {
  MENUS.forEach((menu) => {
    menu();
  });
}
