import { BluetoothEscposPrinter, BluetoothTscPrinter } from "react-native-bluetooth-escpos-printer";

export const tryPrintTSC = string => {
	console.log("received command");
	BluetoothTscPrinter.printLabel({
		width: 40,
		height: 30,
		gap: 20,
		direction: BluetoothTscPrinter.DIRECTION.FORWARD,
		reference: [0, 0],
		tear: BluetoothTscPrinter.TEAR.ON,
		sound: 0,
		text: [
			{
				text: string || "I am a testing txt",
				x: 20,
				y: 0,
				fonttype: BluetoothTscPrinter.FONTTYPE.SIMPLIFIED_CHINESE,
				rotation: BluetoothTscPrinter.ROTATION.ROTATION_0,
				xscal: BluetoothTscPrinter.FONTMUL.MUL_1,
				yscal: BluetoothTscPrinter.FONTMUL.MUL_1
			},
			{
				text: "你在说什么呢?",
				x: 20,
				y: 50,
				fonttype: BluetoothTscPrinter.FONTTYPE.SIMPLIFIED_CHINESE,
				rotation: BluetoothTscPrinter.ROTATION.ROTATION_0,
				xscal: BluetoothTscPrinter.FONTMUL.MUL_1,
				yscal: BluetoothTscPrinter.FONTMUL.MUL_1
			}
		],
		qrcode: [{ x: 20, y: 96, level: BluetoothTscPrinter.EEC.LEVEL_L, width: 3, rotation: BluetoothTscPrinter.ROTATION.ROTATION_0, code: "show me the money" }],
		barcode: [{ x: 120, y: 96, type: BluetoothTscPrinter.BARCODETYPE.CODE128, height: 40, readable: 1, rotation: BluetoothTscPrinter.ROTATION.ROTATION_0, code: "1234567890" }]
	}).catch(error => {
		console.log("***** Error while printing *****");
		console.debug(error.message);
	});
};

export const tryPrintESCPOS = async string => {
	try {
		const text = string || "hello world";
		console.log("received command");
		await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
		await BluetoothEscposPrinter.setBlob(0);
		await BluetoothEscposPrinter.printText(text, {});
	} catch (error) {
		console.log("***** Error while printing *****");
		console.debug(error);
	}
};
