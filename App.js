import React, { PureComponent } from "react";
import {
	SafeAreaView,
	StyleSheet,
	ScrollView,
	StatusBar,
	TouchableHighlight,
	ActivityIndicator,
	Alert,
	ToastAndroid,
	TouchableOpacity,
	Text,
	View,
	Modal,
	Button,
	TouchableNativeFeedback,
	TextInput
} from "react-native";
import { Colors } from "react-native/Libraries/NewAppScreen";
import AsyncStorage from "@react-native-community/async-storage";
import { BluetoothManager } from "react-native-bluetooth-escpos-printer";
import { tryPrintTSC, tryPrintESCPOS } from "./printFunctions";

class App extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			isConnected: false,
			isConnecting: false,
			deviceAddress: "",
			deviceList: [],
			scanning: false,
			error: "",
			showModal: false,
			text: ""
		};
	}

	connectToPrinter = () =>
		BluetoothManager.isBluetoothEnabled().then(
			enabled => {
				if (enabled) {
					this.checkDefaultDevice();
				} else {
					BluetoothManager.enableBluetooth().then(this.checkDefaultDevice);
				}
			},
			error => {
				Alert.alert(
					"Error while checking bluetooth status!",
					error.message,
					[
						{ text: "Cancel", onPress: () => {}, style: "cancel" },
						{ text: "Retry", onPress: this.connectToPrinter }
					],
					{ cancelable: true }
				);
			}
		);

	checkDefaultDevice = async () => {
		const defaultPrinter = await AsyncStorage.getItem("defaultPrinter");

		if (defaultPrinter !== null) {
			this.connectToBluetooth(defaultPrinter, false);
		} else {
			this.scanBluetooth();
		}
	};

	scanBluetooth = () => {
		this.setState({ scanning: true });

		BluetoothManager.scanDevices().then(
			s => {
				const scanned_bluetooth = JSON.parse(s); //JSON string
				let data = [...scanned_bluetooth.found, ...scanned_bluetooth.paired];
				this.setState({ error: "", showModal: true, deviceList: data.map((itm, i) => ({ ...itm, key: `${itm.address}${i}` })), scanning: false });
			},
			error => {
				this.setState({ error: error.message, showModal: true, scanning: false });
				ToastAndroid.show(error.message, 1500);
			}
		);
	};

	connectToBluetooth = async (address, setAddress = true) => {
		if (setAddress) {
			await AsyncStorage.setItem("defaultPrinter", address);
		}

		this.setState({ isConnecting: true });

		BluetoothManager.connect(address) // the device address scanned.
			.then(
				() => {
					this.setState({ isConnecting: false, isConnected: true, deviceAddress: address, showModal: false });
				},
				error => {
					this.setState({ error: error.message, isConnecting: false });
					ToastAndroid.show(error.message, 2000);
					ToastAndroid.show("Scanning bluetooth devices...", 1500);
					this.scanBluetooth();
				}
			);
	};

	modalRequestClose = () => {
		if (!(this.state.scanning || this.state.isConnecting)) {
			this.setState({ showModal: false });
		}
	};

	printUsingTSC = () => tryPrintTSC(this.state.text);

	printUsingESCPOS = () => tryPrintESCPOS(this.state.text);

	render() {
		return (
			<View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
				<StatusBar barStyle="dark-content" />

				{this.state.isConnected ? (
					<>
						<Text style={{ backgroundColor: "green", padding: 5, color: "#fff", marginBottom: 20 }}>Connected to {this.state.deviceAddress}</Text>
						<View style={{ justifyContent: "space-around", height: 150, width: "70%", alignItems: "center" }}>
							<TextInput
								style={{ height: 40, borderColor: "gray", borderWidth: 1, width: "100%" }}
								onChangeText={text => this.setState({ text })}
								value={this.state.text}
								maxLength={20}
								placeholder="Type what you want to print"
							/>
							<TouchableHighlight onPress={this.printUsingTSC} style={{ backgroundColor: "#33C3FF", paddingVertical: 5, paddingHorizontal: 15, width: 130 }}>
								<Text style={{ color: "#fff" }}>Print using TSC</Text>
							</TouchableHighlight>
							<TouchableHighlight onPress={this.printUsingESCPOS} style={{ backgroundColor: "#33C3FF", paddingVertical: 5, paddingHorizontal: 15, width: 160 }}>
								<Text style={{ color: "#fff" }}>Print using ESCPOS</Text>
							</TouchableHighlight>
						</View>
					</>
				) : (
					<TouchableHighlight onPress={this.connectToPrinter} style={{ backgroundColor: "green", padding: 5 }}>
						{this.state.scanning || this.state.isConnecting ? <ActivityIndicator size="small" color="#fff" /> : <Text style={{ color: "#fff" }}>Connect To Printer</Text>}
					</TouchableHighlight>
				)}

				<Modal animationType="fade" transparent visible={this.state.showModal} onRequestClose={this.modalRequestClose}>
					<View style={{ backgroundColor: "rgba(0,0,0,0.7)", flex: 1, alignItems: "center", justifyContent: "center", padding: 15 }}>
						<View style={{ height: 300, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", width: "100%", padding: 10, position: "relative" }}>
							<View>
								<Text style={{}}>Your device is ready to pair with</Text>
							</View>
							{!(this.state.scanning || this.state.isConnecting) ? (
								<TouchableOpacity onPress={() => this.setState({ showModal: false })} style={{ position: "absolute", top: 5, right: 10 }}>
									<Text>X</Text>
								</TouchableOpacity>
							) : null}

							<Text style={{ marginHorizontal: 20, marginBottom: 10, color: "red" }}>{this.state.error}</Text>

							{this.state.scanning === false && this.state.deviceList.length === 0 ? (
								<Button onPress={this.scanBluetooth} icon style={{ alignSelf: "center", marginVertical: 30 }} title="Search Again" />
							) : (
								<ScrollView>
									{this.state.deviceList.map(device => (
										<BluetoothListItem device={device} connectToBluetooth={this.connectToBluetooth} />
									))}
								</ScrollView>
							)}
						</View>
					</View>
				</Modal>
			</View>
		);
	}
}

const BluetoothListItem = props => {
	const connect = () => props.connectToBluetooth(props.device.address);

	return (
		<TouchableNativeFeedback onPress={connect}>
			<View style={{ borderTopWidth: 1, borderTopColor: "#f4f4f4" }}>
				<Text style={{ padding: 5 }}>
					{props.device.name} - {props.device.address}
				</Text>
			</View>
		</TouchableNativeFeedback>
	);
};

const styles = StyleSheet.create({
	scrollView: {
		backgroundColor: Colors.lighter
	},
	engine: {
		position: "absolute",
		right: 0
	},
	body: {
		backgroundColor: Colors.white
	},
	sectionContainer: {
		marginTop: 32,
		paddingHorizontal: 24
	},
	sectionTitle: {
		fontSize: 24,
		fontWeight: "600",
		color: Colors.black
	},
	sectionDescription: {
		marginTop: 8,
		fontSize: 18,
		fontWeight: "400",
		color: Colors.dark
	},
	highlight: {
		fontWeight: "700"
	},
	footer: {
		color: Colors.dark,
		fontSize: 12,
		fontWeight: "600",
		padding: 4,
		paddingRight: 12,
		textAlign: "right"
	}
});

export default App;
