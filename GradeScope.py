import streamlit as st

st.title('✍️ GradeScope')

st.info('This app calculates your pre-final grade. Please input information')

components = st.text_input("What are the components of your grade?")

st.write("components")
