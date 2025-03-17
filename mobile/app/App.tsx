import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginPage from "./LoginPage";
import HomePage from "./Homepage";
import RevenuePage from "./RevenuePage";
import BSPLPage from "./BSPLPage";

const Stack = createStackNavigator();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginPage} />
        <Stack.Screen name="Home" component={HomePage} />
        <Stack.Screen name="Revenue" component={RevenuePage} />
        <Stack.Screen name="BSPL" component={BSPLPage} /> 
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
