
package com.androidcodelibs.androidutilslib.utils.encrypt;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;

/**
 * Copyright 李挺哲
 * 创建人：litingzhe
 * 邮箱：453971498@qq.com
 * Info DES加解密算法类
 */
public class Des {

	private byte[] iv;

	public Des(byte[] iv) {
		super();
		this.iv = iv;
	}

	public static Des newInstance(byte[] iv) {
		Des des = new Des(iv);
		return des;
	}

	public String encrypt(byte[] encryptByte, String encryptKey) {
		try {
			IvParameterSpec zeroIv = new IvParameterSpec(iv);
			SecretKeySpec key = new SecretKeySpec(encryptKey.getBytes(), "DES");
			Cipher cipher = Cipher.getInstance("DES/CBC/PKCS5Padding");
			cipher.init(Cipher.ENCRYPT_MODE, key, zeroIv);
			byte[] encryptedData = cipher.doFinal(encryptByte);
			return Base64.encode(encryptedData);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}

	public byte[] decrypt(String encryptString, String encryptKey) {
		try {
			byte[] encryptByte = Base64.decode(encryptString);
			IvParameterSpec zeroIv = new IvParameterSpec(iv);
			SecretKeySpec key = new SecretKeySpec(encryptKey.getBytes(), "DES");
			Cipher cipher = Cipher.getInstance("DES/CBC/PKCS5Padding");
			cipher.init(Cipher.DECRYPT_MODE, key, zeroIv);
			return cipher.doFinal(encryptByte);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}
	
	/**
     * The main method.
     *
     * @param args the arguments
     */
    public static void main(String[] args) {
    	Des des = Des.newInstance("yxs!1sdf".getBytes());
    	String a = des.encrypt("||||||863920023221158||9c:a9:e4:3b:a1:8a".getBytes(),"bywhjgpt");
    	System.out.println(a);
		System.out.println(des.decrypt(a,"bywhjgpt"));
	}
}