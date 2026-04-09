import ambientBoardMarket from "./ambient_board_market.json";
import ambientFinance from "./ambient_finance.json";
import ambientLabor from "./ambient_labor.json";
import ambientLegalPersonal from "./ambient_legal_personal.json";
import ambientOffshoreEscape from "./ambient_offshore_escape.json";
import ambientOperations from "./ambient_operations.json";
import ambientStabilizers from "./ambient_stabilizers.json";
import core from "./core.json";
import delayedExitPaths from "./delayed_exit_paths.json";
import delayedLabor from "./delayed_labor.json";
import delayedOperationsFinance from "./delayed_operations_finance.json";
import delayedPersonalMarket from "./delayed_personal_market.json";

export const eventPacks = {
  core,
  ambientLabor,
  ambientBoardMarket,
  ambientOperations,
  ambientLegalPersonal,
  ambientFinance,
  ambientOffshoreEscape,
  ambientStabilizers,
  delayedLabor,
  delayedOperationsFinance,
  delayedPersonalMarket,
  delayedExitPaths,
};

export const allEvents = Object.values(eventPacks).flat();
