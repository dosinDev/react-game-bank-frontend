import {
	CircularProgress,
	Grid,
	Modal,
	Typography,
	makeStyles,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { useWeb3React } from "@web3-react/core";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { ConnectWalletButtonItem } from "../ConnectWalletButtonItem";
import {
	STORAGE_KEY_CONNECTOR,
	ConnectorNames,
} from "../../../config/constants";
import React, { useEffect } from "react";
import connectors from "../../../utils/connectors";

const useStyles = makeStyles((theme) => ({
	modal: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	},
	content: {
		outline: "none",
		backgroundColor: theme.colors.black,
		minWidth: 700,
		maxWidth: 700,
		borderRadius: theme.spacing(1),
		paddingTop: theme.spacing(5),
		paddingBottom: theme.spacing(2),
		paddingLeft: theme.spacing(5.5),
		paddingRight: theme.spacing(5.5),
		justifyContent: "center",
		userSelect: `none`,
		[theme.breakpoints.down("sm")]: {
			minWidth: 350,
			maxWidth: 350,
		},
	},
	header: {
		marginBottom: theme.spacing(3),
		display: "flex",
		justifyContent: "center",
		alignItems: "flex-start",
	},
	title: {
		color: theme.colors.third,
		fontSize: 25,
		fontWeight: 700,
	},
	closeButton: {
		padding: theme.spacing(0.5),
		color: theme.colors.primary,
	},
	helper: {
		marginTop: theme.spacing(3),
		textAlign: "center",
		color: theme.colors.third,
		fontSize: 13,
		fontWeight: 600,
	},
	loader: {
		textAlign: "center",
	},
}));

export const ConnectWalletModal = (props) => {
	const classes = useStyles();
	const context = useWeb3React();
	const { onClose, visible } = props;

	// handle logic to recognize the connector currently being activated
	const [activatingConnector, setActivatingConnector] = React.useState();

	useEffect(() => {
		if (activatingConnector && activatingConnector === context.connector) {
			setActivatingConnector(undefined);
			onClose();
		}
		// eslint-disable-next-line
	}, [activatingConnector, context.connector]);

	if (context.error) {
		localStorage.removeItem(STORAGE_KEY_CONNECTOR);
		context.deactivate();
		onClose();
	}

	const isMetamaskEnabled = "ethereum" in window || "web3" in window;

	const onClickWallet = (wallet) => {
		const currentConnector = connectors[wallet];
		if (wallet === ConnectorNames.Injected) {
			setActivatingConnector(currentConnector);
		}
		if (wallet === ConnectorNames.WalletConnect) {
			setActivatingConnector(currentConnector);
		}

		if (wallet) {
			if (
				currentConnector instanceof WalletConnectConnector &&
				currentConnector.walletConnectProvider?.wc?.uri
			) {
				currentConnector.walletConnectProvider = undefined;
			}
			context.activate(currentConnector);
			localStorage.setItem(STORAGE_KEY_CONNECTOR, wallet);
		}
	};

	const isConnectingToWallet = !!activatingConnector;
	let connectingText = `Connecting to wallet`;
	const connectingToMetamask = activatingConnector === connectors.injected;
	const connectingToWalletConnect =
		activatingConnector === connectors.walletconnect;
	if (connectingToMetamask) {
		connectingText = "Waiting for Approval on Metamask";
	}
	if (connectingToWalletConnect) {
		connectingText = "Opening QR for Wallet Connect";
	}

	const disableMetamask = !isMetamaskEnabled || false;

	return (
		<Modal
			className={classes.modal}
			disableBackdropClick={isConnectingToWallet}
			onClose={onClose}
			open={visible}
		>
			<div className={classes.content}>
				<div className={classes.header}>
					<Typography className={classes.title} component="h3">
						Connect Your Wallet
					</Typography>
					{/* <IconButton className={classes.closeButton} onClick={onClose}>
            <CloseIcon />
          </IconButton> */}
				</div>

				{isConnectingToWallet ? (
					<div className={classes.loader}>
						<CircularProgress />
						<Typography>{connectingText}</Typography>
					</div>
				) : (
					<div>
						<Grid container spacing={1} justifyContent="center">
							<Grid item md={6} xs={12}>
								<ConnectWalletButtonItem
									disabled={disableMetamask}
									icon={ConnectorNames.Injected}
									onClick={() => {
										onClickWallet(ConnectorNames.Injected);
									}}
									text="Metamask"
								/>
							</Grid>
							{/* <Grid item md={6} xs={12}>
								<ConnectWalletButtonItem
									disabled={isConnectingToWallet}
									icon={ConnectorNames.WalletConnect}
									onClick={() => {
										onClickWallet(
											ConnectorNames.WalletConnect
										);
									}}
									text="Wallet Connect"
								/>
							</Grid> */}
							{/* <Grid item md={6} xs={12}>
                <ConnectWalletButtonItem
                  disabled={isConnectingToWallet}
                  icon={ConnectorNames.WalletLink}
                  onClick={() => {
                    onClickWallet(ConnectorNames.WalletLink);
                  }}
                  text="Coinbase Wallet"
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <ConnectWalletButtonItem
                  disabled={isConnectingToWallet}
                  icon={ConnectorNames.Fortmatic}
                  onClick={() => {
                    onClickWallet(ConnectorNames.Fortmatic);
                  }}
                  text="Fortmatic"
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <ConnectWalletButtonItem
                  disabled={isConnectingToWallet}
                  icon={ConnectorNames.Portis}
                  onClick={() => {
                    onClickWallet(ConnectorNames.Portis);
                  }}
                  text="Portis"
                />
              </Grid> */}
						</Grid>
					</div>
				)}
				<Typography className={classes.helper}>
					New to Harmony?{" "}
					<a href="https://www.harmony.one">Learn more about it</a>
				</Typography>
			</div>
		</Modal>
	);
};
