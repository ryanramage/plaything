define([], function(){
  /**
   * Writes a Speex Header to the given byte array.
   * 
   * Speex Header structure:
   * <pre>
   *  0 -  7: speex_string
   *  8 - 27: speex_version
   * 28 - 31: speex_version_id
   * 32 - 35: header_size
   * 36 - 39: rate
   * 40 - 43: mode (0=NB, 1=WB, 2=UWB)
   * 44 - 47: mode_bitstream_version
   * 48 - 51: nb_channels
   * 52 - 55: bitrate
   * 56 - 59: frame_size (NB=160, WB=320, UWB=640)
   * 60 - 63: vbr
   * 64 - 67: frames_per_packet
   * 68 - 71: extra_headers
   * 72 - 75: reserved1
   * 76 - 79: reserved2
   * </pre>
   *
   * @param buf     the buffer to write to.
   * @param offset  the from which to start writing.
   * @param sampleRate
   * @param mode
   * @param channels
   * @param vbr
   * @param nframes
   * @return the amount of data written to the buffer.
   */
  public static int writeSpeexHeader(byte[] buf, int offset, int sampleRate,
                                     int mode, int channels, boolean vbr,
                                     int nframes)
  {
    writeString(buf, offset, "Speex   ");    //  0 -  7: speex_string
    writeString(buf, offset+8, "speex-1.0"); //  8 - 27: speex_version
    System.arraycopy(new byte[11], 0, buf, offset+17, 11); // : speex_version (fill in up to 20 bytes)
    writeInt(buf, offset+28, 1);           // 28 - 31: speex_version_id
    writeInt(buf, offset+32, 80);          // 32 - 35: header_size
    writeInt(buf, offset+36, sampleRate);  // 36 - 39: rate
    writeInt(buf, offset+40, mode);        // 40 - 43: mode (0=NB, 1=WB, 2=UWB)
    writeInt(buf, offset+44, 4);           // 44 - 47: mode_bitstream_version
    writeInt(buf, offset+48, channels);    // 48 - 51: nb_channels
    writeInt(buf, offset+52, -1);          // 52 - 55: bitrate
    writeInt(buf, offset+56, 160 << mode); // 56 - 59: frame_size (NB=160, WB=320, UWB=640)
    writeInt(buf, offset+60, vbr?1:0);     // 60 - 63: vbr
    writeInt(buf, offset+64, nframes);     // 64 - 67: frames_per_packet
    writeInt(buf, offset+68, 0);           // 68 - 71: extra_headers
    writeInt(buf, offset+72, 0);           // 72 - 75: reserved1
    writeInt(buf, offset+76, 0);           // 76 - 79: reserved2
    return 80;
  }
  /**
   * Builds a Speex Header.
   * @param sampleRate
   * @param mode
   * @param channels
   * @param vbr
   * @param nframes
   * @return a Speex Header.
   */
  public static byte[] buildSpeexHeader(int sampleRate, int mode, int channels,
                                        boolean vbr, int nframes)
  {
    byte[] data = new byte[80];
    writeSpeexHeader(data, 0, sampleRate, mode, channels, vbr, nframes);
    return data;
  }

  /**
   * Writes a Speex Comment to the given byte array.
   * @param buf     the buffer to write to.
   * @param offset  the from which to start writing.
   * @param comment the comment.
   * @return the amount of data written to the buffer.
   */
  public static int writeSpeexComment(byte[] buf, int offset, String comment)
  {
    int length = comment.length();
    writeInt(buf, offset, length);       // vendor comment size
    writeString(buf, offset+4, comment); // vendor comment
    writeInt(buf, offset+length+4, 0);   // user comment list length
    return length+8;
  }

  /**
   * Builds and returns a Speex Comment.
   * @param comment the comment.
   * @return a Speex Comment.
   */
  public static byte[] buildSpeexComment(String comment)
  {
    byte[] data = new byte[comment.length()+8];
    writeSpeexComment(data, 0, comment);
    return data;
  }
  
 /**
   * Writes the header pages that start the Ogg Speex file. 
   * Prepares file for data to be written.
   * @param comment description to be included in the header.
   * @exception IOException
   */
  public void writeHeader(final String comment)
    throws IOException
  {
    int chksum;
    byte[] header;
    byte[] data;
    /* writes the OGG header page */
    header = buildOggPageHeader(2, 0, streamSerialNumber, pageCount++, 1,
                                new byte[] {80});
    data = buildSpeexHeader(sampleRate, mode, channels, vbr, nframes);
    chksum = OggCrc.checksum(0, header, 0, header.length);
    chksum = OggCrc.checksum(chksum, data, 0, data.length);
    writeInt(header, 22, chksum);
    out.write(header);
    out.write(data);
    /* writes the OGG comment page */
    header = buildOggPageHeader(0, 0, streamSerialNumber, pageCount++, 1,
                                new byte[] {(byte) (comment.length() + 8)});
    data = buildSpeexComment(comment);
    chksum = OggCrc.checksum(0, header, 0, header.length);
    chksum = OggCrc.checksum(chksum, data, 0, data.length);
    writeInt(header, 22, chksum);
    out.write(header);
    out.write(data);
  }
  
  /**
   * Writes a packet of audio. 
   * @param data - audio data.
   * @param offset - the offset from which to start reading the data.
   * @param len - the length of data to read.
   * @exception IOException
   */
  public void writePacket(final byte[] data,
                          final int offset,
                          final int len)
    throws IOException 
  {
    if (len <= 0) { // nothing to write
      return;
    }
    if (packetCount > PACKETS_PER_OGG_PAGE) {
      flush(false);
    }
    System.arraycopy(data, offset, dataBuffer, dataBufferPtr, len);
    dataBufferPtr += len;
    headerBuffer[headerBufferPtr++]=(byte)len;
    packetCount++;
    granulepos += nframes * (mode==2 ? 640 : (mode==1 ? 320 : 160));
  }


})