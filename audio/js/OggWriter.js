define(['js/crc'], function(crc){

    /** Number of packets in an Ogg page (must be less than 255) */
	var PACKETS_PER_OGG_PAGE = 250;

	var ogg_writer = function(emit) {
		this.ondata = emit;	
		this.pageCount = 0;	
		this.streamSerialNumber = Math.floor(Math.random()*10000+1);
	}



    ogg_writer.prototype.writeInitialHeaderPacketPage = function(data, headerNumBytes) {
      	header = buildOggPageHeader(2, 0, this.streamSerialNumber, this.pageCount++, 1, headerNumBytes);
	    chksum = crc(0, header, 0, header.length);
	    chksum = crc(chksum, data, 0, data.length);
	    writeInt(header, 22, chksum);
	    emit(header);
	    emit(data);  	
    };

    ogg_writer.prototype.writeCommentHeaderPacketPage = function(data, numBytes) {
	    header = buildOggPageHeader(0, 0, this.streamSerialNumber, this.pageCount++, 1, numBytes);
	    chksum = crc(0, header, 0, header.length);
	    chksum = crc(chksum, data, 0, data.length);
	    writeInt(header, 22, chksum);
	    emit(header);
	    emit(data);
    };

	  /**
	   * Builds and returns an Ogg Page Header.
	   * @param headerType the header type flag
	   *          (0=normal, 2=bos: beginning of stream, 4=eos: end of stream).
	   * @param granulepos the absolute granule position.
	   * @param streamSerialNumber
	   * @param pageCount
	   * @param packetCount
	   * @param numBytes
	   * @return an Ogg Page Header.
	   */
	  public static byte[] buildOggPageHeader(int headerType, long granulepos,
	                                          int streamSerialNumber, int pageCount,
	                                          int packetCount, byte[] numBytes)
	  {
	    byte[] data = new byte[packetCount+27];
	    writeOggPageHeader(data, 0, headerType, granulepos, streamSerialNumber,
	                       pageCount, packetCount, numBytes);
	    return data;
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

  /**
   * Writes an Ogg Page Header to the given byte array.
   * 
   * Ogg Page Header structure:
   * <pre>
   *  0 -  3: capture_pattern
   *       4: stream_structure_version
   *       5: header_type_flag
   *  6 - 13: absolute granule position
   * 14 - 17: stream serial number
   * 18 - 21: page sequence no
   * 22 - 25: page checksum
   *      26: page_segments
   * 27 -  x: segment_table
   * </pre>
   * 
   * @param buf     the buffer to write to.
   * @param offset  the from which to start writing.
   * @param headerType the header type flag
   *          (0=normal, 2=bos: beginning of stream, 4=eos: end of stream).
   * @param granulepos the absolute granule position.
   * @param streamSerialNumber
   * @param pageCount
   * @param packetCount
   * @param packetSizes
   * @return the amount of data written to the buffer.
   */
	function writeOggPageHeader(byte[] buf, int offset, int headerType,
	                                   long granulepos, int streamSerialNumber,
	                                   int pageCount, int packetCount,
	                                   byte[] packetSizes)
	{
		writeString(buf, offset, "OggS");             //  0 -  3: capture_pattern
		buf[offset+4] = 0;                            //       4: stream_structure_version
		buf[offset+5] = (byte) headerType;            //       5: header_type_flag
		writeLong(buf, offset+6, granulepos);         //  6 - 13: absolute granule position
		writeInt(buf, offset+14, streamSerialNumber); // 14 - 17: stream serial number
		writeInt(buf, offset+18, pageCount);          // 18 - 21: page sequence no
		writeInt(buf, offset+22, 0);                  // 22 - 25: page checksum
		buf[offset+26] = (byte) packetCount;          //      26: page_segments
		System.arraycopy(packetSizes, 0,              // 27 -  x: segment_table
		                 buf, offset+27, packetCount);
		return packetCount+27;
	}



  /**
   * Flush the Ogg page out of the buffers into the file.
   * @param eos - end of stream
   * @exception IOException
   */
  private void flush(final boolean eos)
    throws IOException
  {
    int chksum;
    byte[] header;
    /* writes the OGG header page */
    header = buildOggPageHeader((eos ? 4 : 0), granulepos, streamSerialNumber,
                                pageCount++, packetCount, headerBuffer);
    chksum = OggCrc.checksum(0, header, 0, header.length);
    chksum = OggCrc.checksum(chksum, dataBuffer, 0, dataBufferPtr);
    writeInt(header, 22, chksum);
    out.write(header);
    out.write(dataBuffer, 0, dataBufferPtr);
    dataBufferPtr   = 0;
    headerBufferPtr = 0;
    packetCount     = 0;
  }

	return ogg_writer;
})