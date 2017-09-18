import { Component } from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';
import { ModalInfo } from '../modals/info/info';
import * as math from 'mathjs';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
	public g = {
		resultIEEE: false,
		dataIEEE: {
			m:'',
			original:'',
			sinal:'',
			integer:'',
			binaryInt: '',
			binaryIntReverse: '',
			decimal:'',
			binaryDecimal:'',
			binaryDecimalReverse:'',
			mantissa:'',
			expoente:0,
			normalized:'',
			bias:'',
			numberBias:0,
			ieee:'',
			hex:'',
			binIEEEMount:'',
			isZero:false,
			s:false
		}
	};
	
	constructor(public navCtrl: NavController, public modalCtrl: ModalController) {}
	echoCon (v = null) {
		console.log(v);
	}
	
	f_openModalInfo() {
		let modal = this.modalCtrl.create(ModalInfo);
		modal.present();
	}
	
	f_calcBias(v_bits, b_calcBias, v_value) {
		let v_offSetBias = 2**(v_bits - 1) -1;
		let v_binaryBias: string;
		if (b_calcBias) {
			let v_decimalBias = v_offSetBias + v_value;
			let a_resultConvertInt = this.f_convertIntBinary(v_decimalBias);
			v_binaryBias = String(a_resultConvertInt[0]);
			while (v_binaryBias.length < v_bits) {
				v_binaryBias = '0'+v_binaryBias;
			}
			return [v_binaryBias, v_decimalBias];
		} else return v_offSetBias;
	}
	
	f_calcIEE (v_value, v_defaultBits:string) {
		this.g.resultIEEE = true;
		if (!v_defaultBits || !this.isNumber(v_value)) return;
		
		if (v_value >= 0) {
			this.g.dataIEEE.sinal = '0';
		} else {
			this.g.dataIEEE.sinal = '1';
			v_value = v_value * (-1);
		}
		this.g.dataIEEE.original = v_value;
		
		let v_bitsMantissa:number;
		let v_bitsExpoente:number;		
		
		switch(v_defaultBits) {
			case('b32'):
				if (v_value != 0.0 && (v_value > Number(math.pow(2, 127)) || v_value < Number(math.pow(2, -126)))) {
					this.g.dataIEEE.m = "O valor é inválido para a faixa de valores do float";
					this.g.dataIEEE.s = false;
					return;
				}
				v_bitsMantissa = 23;
				v_bitsExpoente = 8;
			break;
			case('b64'):
				if (v_value != 0.0 && (v_value > Number(math.pow(2, 1023)) || v_value < Number(math.pow(2, -1022)))) {
					this.g.dataIEEE.m = "O valor é inválido para a faixa de valores do double";
					this.g.dataIEEE.s = false;
					return;
				}
				v_bitsMantissa = 52;
				v_bitsExpoente = 11;
			break;
		}
		if (v_value == 0.0) {
			this.f_mountIEEEZero(v_bitsMantissa, v_bitsExpoente);
		} else {
			// return (string | string)
			let a_resultAnalysis = this.f_analysisDecimal(v_value); 
			this.g.dataIEEE.integer = a_resultAnalysis[0];
			this.g.dataIEEE.decimal = a_resultAnalysis[1];
			
			// return (string | number)
			let a_resultIntConvert = this.f_convertIntBinary(this.g.dataIEEE.integer);
			this.g.dataIEEE.binaryInt = String(a_resultIntConvert[0]);
			this.g.dataIEEE.binaryIntReverse = String(a_resultIntConvert[1]); 
			
			// return (string | number)
			let a_resultDecConvert = this.f_convertDecBinary(this.g.dataIEEE.decimal, v_bitsMantissa);
			this.g.dataIEEE.binaryDecimal = String(a_resultDecConvert[0]);
			this.g.dataIEEE.binaryDecimalReverse = String(a_resultDecConvert[1]);
			
			// return (string | string | number)
			let a_resultMountNormalized = this.f_mountNormalized(
				this.g.dataIEEE.binaryInt, this.g.dataIEEE.binaryDecimal, v_bitsMantissa);
			this.g.dataIEEE.mantissa = String(a_resultMountNormalized[0]);
			this.g.dataIEEE.normalized = String(a_resultMountNormalized[1]);
			this.g.dataIEEE.expoente = Number(a_resultMountNormalized[2]);
			
			// return (string | number)
			let a_resultCalcBias = this.f_calcBias(v_bitsExpoente, true, this.g.dataIEEE.expoente);
			this.g.dataIEEE.bias = String(a_resultCalcBias[0]);
			this.g.dataIEEE.numberBias = Number(a_resultCalcBias[1]);
			this.g.dataIEEE.ieee = this.g.dataIEEE.sinal + 
				this.g.dataIEEE.bias +
				this.g.dataIEEE.mantissa;
			
			// return (string | string)
			let a_resultHexIEEE = this.f_mountIEEEHex(this.g.dataIEEE.ieee);
			this.g.dataIEEE.hex = String(a_resultHexIEEE[0]);
			this.g.dataIEEE.binIEEEMount = String(a_resultHexIEEE[1]);
			
			this.g.dataIEEE.m = 'Resultado: ';
			this.g.dataIEEE.isZero = false;
			this.g.dataIEEE.s = true;
		}
	}
	
	f_mountIEEEZero (v_bitsMantissa, v_bitsExpoente) {
		this.g.dataIEEE.sinal = '0';
		this.g.dataIEEE.mantissa = '0'.repeat(v_bitsMantissa);
		this.g.dataIEEE.bias = '0'.repeat(v_bitsExpoente);
		this.g.dataIEEE.ieee = this.g.dataIEEE.sinal + 
			this.g.dataIEEE.bias +
			this.g.dataIEEE.mantissa;
		
		// return (string | string)
		let a_resultHexIEEE = this.f_mountIEEEHex(this.g.dataIEEE.ieee);
		this.g.dataIEEE.hex = String(a_resultHexIEEE[0]);
		this.g.dataIEEE.binIEEEMount = String(a_resultHexIEEE[1]);
		
		this.g.dataIEEE.m = 'Resultado: ';
		this.g.dataIEEE.isZero = true;
		this.g.dataIEEE.s = true;
	}
	
	f_analysisDecimal(v_value) {
		v_value = String(v_value);
		let v_split0 = v_value.split(/\.|,/)[0];
		let v_integer = v_split0 ? v_split0 : '0'; // Separa a parte inteira do valor total
		let v_split1 = v_value.split(/\.|,/)[1];
		let v_decimal = v_split1 ? '0.'+v_split1 : '0.0'; // separa a parte decimal do valor total
		return [v_integer, v_decimal]; // return (string | string)
	}
	
	f_convertIntBinary(v_value) {
		v_value = Number(v_value);
		let v_binaryInt: string = '';	// Onde será armazenado o valor binário
		let v_equivalentBinary: number = 0;	// Onde será armazenado o reverso do binário comparado
		if (v_value < 1) return ['0', '0'];
		else { // Converte a parte inteira do número
			while (v_value > 0) {
				v_binaryInt += String(v_value % 2);
				v_value = parseInt(String(v_value / 2));
			}
			let v_binaryReverse = v_binaryInt;
			for(let i = 0; i < v_binaryReverse.length; i++) {
				v_equivalentBinary += 2**i * Number(v_binaryReverse[i]);
			}
			// Inverte a string, string -> array -> reverse -> join
			v_binaryInt = v_binaryInt.split('').reverse().join(''); 
		} 
		return [v_binaryInt, v_equivalentBinary]; // return (string | number)
	}
	
	f_convertDecBinary(v_value, v_limit) {
		v_value = Number(v_value);
		let v_binaryDec: string = '';	// Onde será armazenado o valor binário
		let v_equivalentBinary: number = 0;	// Onde será armazenado o reverso do binário comparado
		if (v_value >= 1 || v_value == 0.0) return ['0', '0.0']; // return (string | string)
		else { // Converte a parte inteira do número
			let v_initCount = false;
			let v_finishCount = false;
			for(let i = 1, j = 0; !v_finishCount; i++) { // Realiza o loop conforme o limite estabelecido
				v_value *= 2;
				let v_intMulti = Math.trunc(v_value); // Pega o inteiro da multiplicação (apenas 1 | 0)
				if (v_intMulti == 1) {
					v_initCount = true;
				}
				if (v_initCount) j++;
				console.log(i, j, v_intMulti, v_initCount);
				v_binaryDec += String(v_intMulti); // Concatena o valor do binário
				v_equivalentBinary += v_intMulti*2**(-1 * i); // Realiza o caminho inverso
				v_value %= 1; // Remove o inteiro, mantendo apenas o decimal
				if (j == v_limit+1 && v_initCount) v_finishCount = true;
			}
		} 
		return [v_binaryDec, v_equivalentBinary]; // return (string | number)
	}
	
	f_mountIEEEHex(v_binaryIEEE) {
		let a_fourBinary = v_binaryIEEE.match(/([0-1]{4})/g);
		let v_hexIEEE = '';
		let v_binSeparate:string;
		let a_hexMap = {
			"0000" : "0",
			"0001" : "1",
			"0010" : "2",
			"0011" : "3",
			"0100" : "4",
			"0101" : "5",
			"0110" : "6",
			"0111" : "7",
			"1000" : "8",
			"1001" : "9",
			"1010" : "A",
			"1011" : "B",
			"1100" : "C",
			"1101" : "D",
			"1110" : "E",
			"1111" : "F"
		};
		
		for(let v_bin of a_fourBinary) {
			v_hexIEEE += a_hexMap[v_bin];
		}
		v_binSeparate = a_fourBinary.join('.');
		return [v_hexIEEE, v_binSeparate];
	}
	
	f_mountNormalized(v_integer, v_decimal, v_precision) {
		let v_exp: number;
		let v_mantissa: string;
		if (v_integer != '0') {
			v_exp = v_integer.length - 1;
			v_mantissa = (v_integer+v_decimal).slice(1, v_precision+1);
		} else {
			let v_idxN1 = v_decimal.indexOf('1');
			v_exp = v_idxN1+1;
			v_mantissa = v_decimal.slice(v_exp, v_idxN1+v_precision+1);
			console.log(v_exp, v_idxN1, v_precision, v_decimal, v_idxN1+v_precision+1);
			v_exp *= -1;
		}
		while (v_mantissa.length < v_precision) {
			v_mantissa += '0';
		}
		
		// return (string | string | number ) -> mantissa | nomalizado | expoente
		return [v_mantissa, 
			'1.'+v_mantissa+' * 2^'+String(v_exp), 
			v_exp]; 
	}
	
	isNumber(val){
		val = val.replace(',','.');
		var RegExp = /^(\-)?[0-9]+(\.[0-9]+)?$/;
		var match = RegExp.exec(val);
		if (match) {
			return match[0];
		} else {
			return '';
		}
	}
}