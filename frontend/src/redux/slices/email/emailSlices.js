import { createAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { baseUrl } from "../../../utils/baseURL";

const resetEmailAction = createAction("email/reset");

export const sendEmailAction = createAsyncThunk(
  "email/sent",
  async (email, { rejectWithValue, getState, dispatch }) => {
    //get user token
    const user = getState().users;
    const { userAuth } = user;
    const config = {
      headers: {
        Authorization: `Bearer ${userAuth?.token}`,
      },
    };
    //http call
    try {
      const { data } = await axios.post(
        `${baseUrl}/api/email`,
        {
          to: email?.recipientEmail,
          subject: email?.subject,
          message: email?.message,
        },
        config
      );
      dispatch(resetEmailAction());
      return data;
    } catch (error) {
      if (!error?.response) {
        throw error;
      }
      return rejectWithValue(error?.response.data);
    }
  }
);

//slices
const sendEmailSlices = createSlice({
  name: "email",
  initialState: {},
  extraReducers: (builder) => {
    builder.addCase(sendEmailAction.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(resetEmailAction, (state, action) => {
      state.isEmailSent = true;
    });
    builder.addCase(sendEmailAction.fulfilled, (state, action) => {
      state.emailSent = action?.payload;
      state.isEmailSent = false;
      state.loading = false;
      state.appErr = undefined;
      state.serverErr = undefined;
    });
    builder.addCase(sendEmailAction.rejected, (state, action) => {
      state.loading = false;
      state.appErr = action?.payload?.message;
      state.serverErr = action?.error?.message;
    });
  },
});

export default sendEmailSlices.reducer;
