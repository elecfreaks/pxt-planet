/**
* Functions to Planet sensor by ELECFREAKS Co.,Ltd.
*/
//% color=#0000ff  icon="\uf06d" block="Planet_B" blockId="_B"
namespace Planet_B {
///////////////////////// matrixInit/////////////////////

    let initializedMatrix = false
    const HT16K33_ADDRESS = 0x70
    const HT16K33_BLINK_CMD = 0x80
    const HT16K33_BLINK_DISPLAYON = 0x01
    const HT16K33_CMD_BRIGHTNESS = 0xE0
    let matBuf = pins.createBuffer(17)
    function matrixInit() {
        i2ccmd(HT16K33_ADDRESS, 0x21);// turn on oscillator
        i2ccmd(HT16K33_ADDRESS, HT16K33_BLINK_CMD | HT16K33_BLINK_DISPLAYON | (0 << 1));
        i2ccmd(HT16K33_ADDRESS, HT16K33_CMD_BRIGHTNESS | 0xF);
    }
    function i2ccmd(addr: number, value: number) {
        let buf = pins.createBuffer(1)
        buf[0] = value
        pins.i2cWriteBuffer(addr, buf)
    }
    function matrixShow() {
        matBuf[0] = 0x00;
        pins.i2cWriteBuffer(HT16K33_ADDRESS, matBuf);
    }
    ///////////////////////////////
    export enum DigitalRJPin {
        //% block="J1 (P1,P8)"
        J1,
        //% block="J2 (P2,P12)"
        J2,
        //% block="J3 (P13,P14)"
        J3,
        //% block="J4 (P15,P16)"
        J4
    }
    export enum AnalogRJPin {
        //% block="J1 (P1,P8)"
        J1,
        //% block="J2 (P2,P12)"
        J2
    }
	
	    //% shim=DS18B20::Temperature
    export function Temperature_read(p: number): number {
        // Fake function for simulator
        return 0
    }

    //% block="at pin %Rjpin ds18b20 Temperature(℃)value"
    //% Rjpin.fieldEditor="gridpicker"
    //% Rjpin.fieldOptions.columns=2
    //% subcategory=Sensor
    export function Temperature18b20(Rjpin: DigitalRJPin): number {
        // Fake function for simulator
        let temp: number = 0;
        switch (Rjpin) {
            case DigitalRJPin.J1:
                temp = Temperature_read(1)
                break;
            case DigitalRJPin.J2:
                temp = Temperature_read(2)
                break;
            case DigitalRJPin.J3:
                temp = Temperature_read(13)
                break;
            case DigitalRJPin.J4:
                temp = Temperature_read(15)
                break;
        }
        temp = temp / 100
        return temp
    }
	   //% block="at pin %Rjpin ADKeyboard key %key is pressed"
    //% Rjpin.fieldEditor="gridpicker"
    //% Rjpin.fieldOptions.columns=2
    //% key.fieldEditor="gridpicker"
    //% key.fieldOptions.columns=2
    //% subcategory=Input
    export function ADKeyboard(Rjpin: AnalogRJPin, key: ADKeyList): boolean {
        let pin = AnalogPin.P1
        switch (Rjpin) {
            case AnalogRJPin.J1:
                pin = AnalogPin.P1
                break;
            case AnalogRJPin.J2:
                pin = AnalogPin.P2
                break;
        }
        let Analog_number: number = pins.analogReadPin(pin);
        switch (key) {
            case ADKeyList.A:
                if (Analog_number < 10) {
                    return true;
                }
                else {
                    return false
                }
                break;
            case ADKeyList.B:
                if (Analog_number >= 40 && Analog_number <= 60) {
                    return true;
                }
                else {
                    return false
                }
                break;
            case ADKeyList.C:
                if (Analog_number >= 80 && Analog_number <= 110) {
                    return true;
                }
                else {
                    return false
                }
                break;
            case ADKeyList.D:
                if (Analog_number >= 130 && Analog_number <= 150) {
                    return true;
                }
                else {
                    return false
                }
                break;
            case ADKeyList.E:
                if (Analog_number >= 530 && Analog_number <= 560) {
                    return true;
                }
                else {
                    return false
                }
                break;

        }
    }
	
	    /**
     * get dust value (μg/m³) 
    * @param vLED describe parameter here, eg: DigitalPin.P16
     * @param vo describe parameter here, eg: AnalogPin.P1
    */
    //% blockId="readdust" block="at pin %Rjpin value of dust(μg/m³) "
    //% Rjpin.fieldEditor="gridpicker"
    //% Rjpin.fieldOptions.columns=2
    //% subcategory=Sensor 
    export function Dust(Rjpin: AnalogRJPin): number {
        let vLED: DigitalPin, vo: AnalogPin
        switch (Rjpin) {
            case AnalogRJPin.J1:
                vLED = DigitalPin.P8
                vo = AnalogPin.P1
                break;
            case AnalogRJPin.J2:
                vLED = DigitalPin.P12
                vo = AnalogPin.P2
                break;
        }
        let voltage = 0, dust = 0;
        pins.digitalWritePin(vLED, 0);
        control.waitMicros(160);
        voltage = pins.analogReadPin(vo);
        control.waitMicros(100);
        pins.digitalWritePin(vLED, 1);
        voltage = pins.map(
            voltage,
            0,
            1023,
            0,
            3100 / 2 * 3
        );
        dust = (voltage - 380) * 5 / 29;
        if (dust < 0) {
            dust = 0
        }
        return Math.round(dust)
    }

    //% block="at pin IIC Matrix Refresh"
    //% group=Matrix subcategory=Output
    export function MatrixRefresh(): void {
        if (!initializedMatrix) {
            matrixInit();
            initializedMatrix = true;
        }
        matrixShow();
    }

    //% block="at pin IIC Matrix Clear"
    //% group=Matrix subcategory=Output
    export function MatrixClear(): void {
        if (!initializedMatrix) {
            matrixInit();
            initializedMatrix = true;
        }
        for (let i = 0; i < 16; i++) {
            matBuf[i + 1] = 0;
        }
        matrixShow();
    }
    //% block="at pin IIC Matrix Draw|X %x|Y %y"
    //% group=Matrix subcategory=Output
    export function MatrixDraw(x: number, y: number): void {
        if (!initializedMatrix) {
            matrixInit();
            initializedMatrix = true;
        }
        x = Math.round(x)
        y = Math.round(y)

        let idx = y * 2 + Math.idiv(x, 8);

        let tmp = matBuf[idx + 1];
        tmp |= (1 << (x % 8));
        matBuf[idx + 1] = tmp;
    }
    //% block="at pin IIC Matrix show emoji %ID"
    //% group=Matrix subcategory=Output
    export function MatrixEmoji(ID: emojiList) {
        MatrixClear();
        let point;
        switch (ID) {
            case 0:
                point = [[2, 0], [13, 0],
                [3, 1], [12, 1],
                [4, 2], [11, 2],
                [3, 3], [12, 3],
                [2, 4], [5, 4], [6, 4], [7, 4], [8, 4], [9, 4], [10, 4], [13, 4],
                [5, 5], [7, 5], [8, 5], [10, 5],
                [5, 6], [10, 6],
                [6, 7], [7, 7], [8, 7], [9, 7]
                ];
                break;
            case 1:
                point = [[2, 1], [3, 1], [13, 1], [12, 1],
                [2, 2], [3, 2], [13, 2], [12, 2],
                [2, 3], [3, 3], [13, 3], [12, 3],
                [5, 5], [6, 5], [7, 5], [8, 5], [9, 5], [10, 5],
                [5, 6], [6, 6], [7, 6], [8, 6], [9, 6], [10, 6]
                ];
                break;
            case 2:
                point = [[1, 2], [5, 2], [10, 2], [14, 2],
                [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [10, 3], [11, 3], [12, 3], [13, 3], [14, 3],
                [2, 4], [3, 4], [4, 4], [11, 4], [12, 4], [13, 4],
                [6, 6], [7, 6], [8, 6], [9, 6],
                [5, 7], [10, 7]
                ];
                break;
            case 3:
                point = [[2, 1], [3, 1], [13, 1], [12, 1],
                [2, 2], [3, 2], [13, 2], [12, 2],
                [2, 3], [3, 3], [13, 3], [12, 3],
                [5, 5], [10, 5],
                [6, 6], [7, 6], [8, 6], [9, 6]
                ];
                break;
            case 4:
                point = [[2, 0], [13, 0],
                [3, 1], [12, 1],
                [3, 2], [4, 2], [11, 2], [12, 2],
                [3, 3], [4, 3], [11, 3], [12, 3],
                [6, 6], [7, 6], [8, 6], [9, 6],
                [5, 7], [10, 7]
                ];
                break;
        }
        let index_max = point.length
        for (let index = 0; index < index_max; index++) {
            MatrixDraw(point[index][0], point[index][1])
        }
        MatrixRefresh();
    }

}