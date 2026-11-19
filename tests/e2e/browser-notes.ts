/**
 * Reason for skipping keyboard-walk tests on WebKit: like Safari, it leaves links and buttons out
 * of the Tab order unless macOS "Full Keyboard Access" is on, so native Tab cannot reach them.
 * Chromium and Firefox run these tests; the WebKit projects still run everything else.
 */
export const WEBKIT_TAB_ORDER =
    "WebKit skips links and buttons on Tab unless macOS Full Keyboard Access is on";
